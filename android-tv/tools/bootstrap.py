#!/usr/bin/env python3
"""Install the pinned, checksum-verified build tools outside the checkout."""
import argparse, hashlib, shutil, tempfile, urllib.request, zipfile
from pathlib import Path
from xml.etree import ElementTree as ET
SDK_BASE = 'https://dl.google.com/android/repository/'
PACKAGES = [
 ('platforms/android-35', 'platform-35_r02.zip', '0bb560a90a7a2cbd0dd8348224d518b638fe7949', 'android.jar'),
 ('build-tools/35.0.0', 'build-tools_r35_linux.zip', '2cfaa0bbb2336e9ec18ed3ecea84fa2e2af607bc', 'aapt2')
]

def download(url):
    with urllib.request.urlopen(url, timeout=120) as response: return response.read()

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--sdk-root',type=Path,default=Path('/workspace/.tools/sabah-tv-sdk'));args=parser.parse_args()
    root=args.sdk_root;root.mkdir(parents=True,exist_ok=True)
    catalogue=download(SDK_BASE+'repository2-1.xml');tree=ET.fromstring(catalogue)
    for relative,filename,expected,marker in PACKAGES:
        advertised=[node for node in tree.iter() if node.tag.endswith('complete') and node.findtext('url')==filename]
        if not advertised or not any(n.findtext('checksum')==expected for n in advertised):raise RuntimeError('Pinned SDK checksum differs from official catalogue: '+filename)
        destination=root/relative
        if (destination/marker).is_file():continue
        body=download(SDK_BASE+filename)
        if hashlib.sha1(body).hexdigest()!=expected:raise RuntimeError('SDK checksum verification failed: '+filename)
        with tempfile.TemporaryDirectory(dir=root) as temp:
            archive=Path(temp)/filename;archive.write_bytes(body)
            with zipfile.ZipFile(archive) as z:
                for member in z.infolist():
                    target=Path(temp)/'unpacked'/member.filename
                    if not target.resolve().is_relative_to((Path(temp)/'unpacked').resolve()):raise RuntimeError('Unsafe archive path')
                z.extractall(Path(temp)/'unpacked')
                for member in z.infolist():
                    mode=(member.external_attr>>16)&0o777
                    target=Path(temp)/'unpacked'/member.filename
                    if target.is_file() and mode:target.chmod(mode)
            folder=next((Path(temp)/'unpacked').rglob(marker)).parent
            destination.parent.mkdir(parents=True,exist_ok=True);shutil.move(str(folder),destination)
        print('Verified and installed '+relative,flush=True)
    compiler=root/'ecj-3.40.0.jar'
    if not compiler.exists():
        url='https://repo.maven.apache.org/maven2/org/eclipse/jdt/ecj/3.40.0/ecj-3.40.0.jar'
        expected=download(url+'.sha1').decode().strip().split()[0];body=download(url)
        if hashlib.sha1(body).hexdigest()!=expected:raise RuntimeError('Compiler checksum verification failed')
        compiler.write_bytes(body)
    for node in tree:
        if node.tag.endswith('license') and node.attrib.get('id')=='android-sdk-license':(root/'ANDROID-SDK-LICENSE.txt').write_text(''.join(node.itertext()))
    print('SDK ready at '+str(root),flush=True)
if __name__=='__main__':main()
