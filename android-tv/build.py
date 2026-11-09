#!/usr/bin/env python3
"""Build a signed, sideloadable Android TV APK without changing the web project."""
import argparse, os, shutil, subprocess, zipfile
from pathlib import Path
ROOT=Path(__file__).resolve().parent

def run(*args):
    subprocess.run([str(arg) for arg in args],check=True)

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--sdk-root',type=Path,default=Path('/workspace/.tools/sabah-tv-sdk'));parser.add_argument('--keystore',type=Path,default=Path('/workspace/.keys/sabah-fc-tv-debug.keystore'));args=parser.parse_args()
    sdk=args.sdk_root;tools=sdk/'build-tools/35.0.0';platform=sdk/'platforms/android-35/android.jar';compiler=sdk/'ecj-3.40.0.jar'
    for path in [tools/'aapt2',platform,compiler]:
        if not path.is_file():raise SystemExit('Run tools/bootstrap.py first: missing '+str(path))
    build=ROOT/'build';build.mkdir(exist_ok=True)
    for folder in ['classes','generated','dex']:
        destination=build/folder
        if destination.exists():shutil.rmtree(destination)
        destination.mkdir()
    compiled=build/'resources.zip';unsigned=build/'resources.apk';aligned=build/'aligned.apk';output=build/'Sabah-FC-TV-v1.0.0.apk'
    for path in [compiled,unsigned,aligned,output]:
        if path.exists():path.unlink()
    run(tools/'aapt2','compile','--dir',ROOT/'res','-o',compiled)
    run(tools/'aapt2','link','-o',unsigned,'-I',platform,'--manifest',ROOT/'AndroidManifest.xml','--java',build/'generated','-A',ROOT/'assets','--min-sdk-version','23','--target-sdk-version','35','--version-code','1','--version-name','1.0.0',compiled)
    sources=[*ROOT.joinpath('src').rglob('*.java'),*build.joinpath('generated').rglob('*.java')]
    run('java','-jar',compiler,'-proc:none','-source','8','-target','8','-bootclasspath',platform,'-d',build/'classes',*sources)
    run('java','-cp',tools/'lib/d8.jar','com.android.tools.r8.D8','--lib',platform,'--min-api','23','--output',build/'dex',*build.joinpath('classes').rglob('*.class'))
    with zipfile.ZipFile(unsigned,'a',zipfile.ZIP_DEFLATED) as archive:
        for dex in build.joinpath('dex').glob('*.dex'):archive.write(dex,dex.name)
    run(tools/'zipalign','-p','-f','4',unsigned,aligned)
    if not args.keystore.exists():
        args.keystore.parent.mkdir(parents=True,exist_ok=True);args.keystore.parent.chmod(0o700)
        run('keytool','-genkeypair','-noprompt','-keystore',args.keystore,'-alias','androiddebugkey','-storepass','android','-keypass','android','-keyalg','RSA','-keysize','2048','-validity','10000','-dname','CN=Sabah FC TV Development,OU=Fan Portal,O=Sabah FC Fan Portal,C=MY')
        args.keystore.chmod(0o600)
    run('java','-jar',tools/'lib/apksigner.jar','sign','--ks',args.keystore,'--ks-key-alias','androiddebugkey','--ks-pass','pass:android','--key-pass','pass:android','--out',output,aligned)
    run('java','-jar',tools/'lib/apksigner.jar','verify','--verbose',output)
    run(tools/'zipalign','-c','-p','4',output)
    print('APK ready: '+str(output))
    print('Size: '+str(output.stat().st_size)+' bytes')
if __name__=='__main__':main()
