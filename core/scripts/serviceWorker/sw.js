if(!self.define){let e,c={};const r=(r,a)=>(r=new URL(r+".js",a).href,c[r]||new Promise((c=>{if("document"in self){const e=document.createElement("script");e.src=r,e.onload=c,document.head.appendChild(e)}else e=r,importScripts(r),c()})).then((()=>{let e=c[r];if(!e)throw new Error(`Module ${r} didn’t register its module`);return e})));self.define=(a,o)=>{const i=e||("document"in self?document.currentScript.src:"")||location.href;if(c[i])return;let n={};const s=e=>r(e,i),d={module:{uri:i},exports:n,require:s};c[i]=Promise.all(a.map((e=>d[e]||s(e)))).then((e=>(o(...e),n)))}}define(["./workbox-a2f1bc43"],(function(e){"use strict";self.addEventListener("message",(e=>{e.data&&"SKIP_WAITING"===e.data.type&&self.skipWaiting()})),e.precacheAndRoute([{url:"../../../core/data/ACTN3/ACTN3.fasta",revision:"93e810b1ce0401a46e96ceaba5687a8f"},{url:"../../../core/data/ACTN3/Benchling_gRNA_Outputs.xlsx",revision:"9d9a05ae5858671f89b87ae185b4917b"},{url:"../../../core/data/APOE/APOE.fasta",revision:"11534c5731809659efe7429170dc4ae2"},{url:"../../../core/data/APOE/Benchling_gRNA_Outputs.xlsx",revision:"d728b00ab3559732abc114c43893ba7e"},{url:"../../../core/data/Background_info/gene_background_info.json",revision:"f8b633e68c24eaa5b26621cd651a6b48"},{url:"../../../core/data/Benchling_gRNA_Ouputs.json",revision:"389e48b87ae5bf6d18d73c256df060d2"},{url:"../../../core/data/CCR5/Benchling_gRNA_Outputs.xlsx",revision:"d204b7de85c0def6a40789a3104dd975"},{url:"../../../core/data/CCR5/CCR5.fasta",revision:"312805e16f0bbaa7378ace3ab275d1b5"},{url:"../../../core/data/eBFP/Benchling_gRNA_outputs.xlsx",revision:"cb29f7f64c8c0f44cfe58c3504af0d2b"},{url:"../../../core/data/eBFP/eBFP.fasta",revision:"3a891a57f27b8180825de1a70974e0ad"},{url:"../../../core/data/HBB/Benchling_gRNA_Outputs.xlsx",revision:"571ef05c0a5fc985423f08ab13e3fc71"},{url:"../../../core/data/HBB/HBB.fasta",revision:"369111a8a700d52e494b75cffef452f9"},{url:"../../../core/icon/android-chrome-192x192.png",revision:"4ef582f1190f74a74cd92515629ad6de"},{url:"../../../core/icon/android-chrome-512x512.png",revision:"30198a74a2a2428b0fd79a5a6f9fa857"},{url:"../../../core/icon/apple-touch-icon-114x114-precomposed.png",revision:"0e22764fc78158a1e123552977cf1e99"},{url:"../../../core/icon/apple-touch-icon-114x114.png",revision:"10a7dd14d4341a4691283129b8579704"},{url:"../../../core/icon/apple-touch-icon-120x120-precomposed.png",revision:"6f9384874582f4905c2421d1c688fa9f"},{url:"../../../core/icon/apple-touch-icon-120x120.png",revision:"2adf14e5ac2c7ab70af98e22d346e700"},{url:"../../../core/icon/apple-touch-icon-144x144-precomposed.png",revision:"5af1b895bb965e4e1b6d5bb01fe452cf"},{url:"../../../core/icon/apple-touch-icon-144x144.png",revision:"0e2e67b8e0339d8ac6035c9e6701f8bc"},{url:"../../../core/icon/apple-touch-icon-152x152-precomposed.png",revision:"b0208a7cc85f05af5a0a98c60ee54c77"},{url:"../../../core/icon/apple-touch-icon-152x152.png",revision:"3cad9487c553c1c3b4709799ea78470c"},{url:"../../../core/icon/apple-touch-icon-180x180-precomposed.png",revision:"01dda0fa7ecda91ebf3791cb67ea4938"},{url:"../../../core/icon/apple-touch-icon-180x180.png",revision:"747c1a80091deae22f19af90c430c6c7"},{url:"../../../core/icon/apple-touch-icon-57x57-precomposed.png",revision:"eae10993b6680f2b4545dbc14e6949bc"},{url:"../../../core/icon/apple-touch-icon-57x57.png",revision:"806090b3afc63b0ad4f03c20591513dc"},{url:"../../../core/icon/apple-touch-icon-60x60-precomposed.png",revision:"f061043b285900384a74204c7dda57cb"},{url:"../../../core/icon/apple-touch-icon-60x60.png",revision:"04335d43763db098368a608c12f9abe1"},{url:"../../../core/icon/apple-touch-icon-72x72-precomposed.png",revision:"b076785e694f689cbae6becbd8d9de16"},{url:"../../../core/icon/apple-touch-icon-72x72.png",revision:"efac06c4863d3649b9491019bfb5715c"},{url:"../../../core/icon/apple-touch-icon-76x76-precomposed.png",revision:"0ec726547d076787474573a6478d84e6"},{url:"../../../core/icon/apple-touch-icon-76x76.png",revision:"5c5be9eb13d6afa8163f2a9fcd47455a"},{url:"../../../core/icon/apple-touch-icon-precomposed.png",revision:"01dda0fa7ecda91ebf3791cb67ea4938"},{url:"../../../core/icon/apple-touch-icon.png",revision:"747c1a80091deae22f19af90c430c6c7"},{url:"../../../core/icon/browserconfig.xml",revision:"64847bbdce0224419ebe5a8485155c43"},{url:"../../../core/icon/favicon-16x16.png",revision:"0a91bb8efc24058fafe44cc85974baa7"},{url:"../../../core/icon/favicon-32x32.png",revision:"19265153d7a917a9346c170c900d8448"},{url:"../../../core/icon/favicon.ico",revision:"d4c4a2750aef0f1c761b9cc74774c6df"},{url:"../../../core/icon/manifest.json",revision:"f7c20169d2a53bf5044324384d2a06b2"},{url:"../../../core/icon/maskable_icon_x128.png",revision:"4231f6cdc22d4f6940fbb3c881c22766"},{url:"../../../core/icon/maskable_icon_x192.png",revision:"37ba8db4e92acc47554f70424fa47703"},{url:"../../../core/icon/maskable_icon_x384.png",revision:"eeec97b54c7059e47663d79aa39a275a"},{url:"../../../core/icon/maskable_icon_x48.png",revision:"8903690126ba89993471a8b9f48a02c3"},{url:"../../../core/icon/maskable_icon_x512.png",revision:"eb60818cc1f0d0d99e5964e44e3350ab"},{url:"../../../core/icon/maskable_icon_x72.png",revision:"41213d251ba40a58d925d5170e930717"},{url:"../../../core/icon/maskable_icon_x96.png",revision:"6a11d918c5699fbdec9ffa8575ec6c17"},{url:"../../../core/icon/maskable_icon.png",revision:"35bb85aa536e9f874b2e7a1f6c496f23"},{url:"../../../core/icon/mstile-144x144.png",revision:"90aed52d21c282a59abfff2c71e58b1e"},{url:"../../../core/icon/mstile-150x150.png",revision:"b8cb6218a71997ad1f5a4d7da3f0608b"},{url:"../../../core/icon/mstile-310x150.png",revision:"49e677836f64b8a7ffbce04187e38522"},{url:"../../../core/icon/mstile-310x310.png",revision:"cea904de800e8ea563242bcbff5be7b9"},{url:"../../../core/icon/mstile-70x70.png",revision:"8eab8053e66cf33f9ee40b4ebda2d88b"},{url:"../../../core/icon/safari-pinned-tab.svg",revision:"54a1630a19583c98ce5ab9058b63112e"},{url:"../../../core/images/BackgroundImage/grey.jpg",revision:"065224611754e9db520269b9c0dc6435"},{url:"../../../core/images/BackgroundImage/homeBackground.jpg",revision:"a32d34cc757120be797fc9bcca06aafb"},{url:"../../../core/images/dna.png",revision:"f92aa79539b1c4eb4e640f88d42758d5"},{url:"../../../core/images/dna.svg",revision:"f7da930929704bfb069b6afc5e9f532f"},{url:"../../../core/images/EDITmd/001_MongoExample-GeneInformation.png",revision:"1925a510e7c3bdc96a92caaf419d45f2"},{url:"../../../core/images/EDITmd/002_SciGradePracticeGene.png",revision:"6f3b2e4652740b3f4d255efa4dd356f9"},{url:"../../../core/images/EDITmd/003_SciGradeAccountManagement.png",revision:"57388551f304609acdf7fb5f8a81b37f"},{url:"../../../core/images/EDITmd/004_FeedbackPage.png",revision:"8807660d3c402371e1083ca46e334119"},{url:"../../../core/images/EDITmd/005_Algorithm.png",revision:"f179bdc2d1959e2e269b8b8cfe3a4ae1"},{url:"../../../core/images/EDITmd/006_AddStudents.png",revision:"09fba282809a5f790fa3a3efb777acd7"},{url:"../../../core/images/EDITmd/007_AddTA.png",revision:"82baf7d2d8c6e1be9d2f45d758c42a9d"},{url:"../../../core/images/EDITmd/008_AdjustMarks.png",revision:"bdaf1cf1e246f8304b575a3c74c32b48"},{url:"../../../core/images/EDITmd/009_ChangeType.png",revision:"69bb390d14f60ba4e880780de8dcdbf9"},{url:"../../../core/images/logo_transparent-Dark.png",revision:"a9b48c32e7d72029db56882586c462c0"},{url:"../../../core/images/logo_transparent-Dark.svg",revision:"fafa9b4919ba7352375e88783d864a56"},{url:"../../../core/images/logo_transparent.png",revision:"86746c9170e4cc9fccb363d0c54b3497"},{url:"../../../core/images/logo_transparent.svg",revision:"ea1adad00f25a0603a975782575abdb1"},{url:"../../../core/scripts/APIandLibraries/Bootstrap/bootstrap.min.css",revision:"6d418e5e96f0d9e04ea93d18d90500cd"},{url:"../../../core/scripts/APIandLibraries/Bootstrap/bootstrap.min.js",revision:"fb975a54300458089e4609e8bee7e814"},{url:"../../../core/scripts/APIandLibraries/Bootstrap/popper.min.js",revision:"499c736b389842485292bd8cd0b9b3fd"},{url:"../../../core/scripts/APIandLibraries/Fonts/MaterialIcon.css",revision:"590d4d51824a5dfddc6fd514acd65ccd"},{url:"../../../core/scripts/APIandLibraries/Google/analyicsNO-ID.js",revision:"b1bff09314720296b944fa423614d605"},{url:"../../../core/scripts/APIandLibraries/Google/platform.js",revision:"ba414772bf3cb192be5528203e424989"},{url:"../../../core/scripts/APIandLibraries/jQuery/jquery.min.js",revision:"b61aa6e2d68d21b3546b5b418bf0e9c3"},{url:"../../../core/scripts/APIandLibraries/MongoDB/stitch.min.js",revision:"911b2a83fd808bb7905d9379a205fdb0"},{url:"../../../core/scripts/APIandLibraries/tabletoCSV/bower.json",revision:"0bf77effd4c952f15fddebf16b6687d6"},{url:"../../../core/scripts/APIandLibraries/tabletoCSV/jquery.tabletoCSV.js",revision:"8e00df5e46a2711929f10c2863c2f9bc"},{url:"../../../core/scripts/APIandLibraries/tabletoCSV/README.md",revision:"1375c24a3db5a713665c04e433244bf0"},{url:"../../../core/scripts/crispr_scripts.js",revision:"e5f6115c685825d5dbe2a43822596af0"},{url:"../../../core/scripts/crispr_scripts.min.js",revision:"0011ba55ef2a8e45add901b5e4ea65a6"},{url:"../../../core/scripts/login.js",revision:"5007a3bde81449d2b205791848a229f9"},{url:"../../../core/scripts/login.min.js",revision:"9281d818fbb6178fd21cba236bd8b46a"},{url:"../../../core/styling/style.css",revision:"07e5ea8d1b8675f99d2540b50b807580"},{url:"../../../core/styling/style.min.css",revision:"b2195ece89ca8a57660c4a587a27c8fd"},{url:"../../../core/systemrun.html",revision:"752860a1922f81df2ceb9eae77db60e9"}],{})}));
//# sourceMappingURL=sw.js.map
