# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/) and this project adheres to [Semantic Versioning](http://semver.org/).

To see tags and releases, please go to [Tags](https://github.com/AlexJSully/SciGrade/tags) on [GitHub](https://github.com/AlexJSully/SciGrade).

## [1.1.1] - 2023-08-03

No longer supports Internet Explorer.

**Optimization**:

-   Added ESLint
-   Optimized images
-   Updated web manifest

**Update**:

-   Updated OSSAR workflow
-   Updated packages

**Bug fixes**:

-   Fixed CaptureConsole not found and unable to call CaptureConsole
-   Fixed TypeError cannot read undefined 0
-   Fixed unable to open or close account modal
-   Fixed wrong version of Sentry offline integrations

## [1.1.0] - 2022-11-03

**A brand new version of the [SciGrade](https://scigrade.com/) has dropped!**

Version 1.1.0 has now dropped and it includes the ability to do practice genes without an account as well as optimizations and bug fixes.

**Feature**:

-   Can now do practice genes without an account

**Optimization**:

-   Added Sentry
-   Added high fetch priority to LCP image
-   Added missing dynamic structured data
-   Added more accessibility support
-   Added sitemap
-   Converted single declaration variables to const
-   Optimized images and SVGs
-   Preload styles
-   Removed depreciated code
-   Removed redundant code
-   Removed unused variables
-   Update IE cache control
-   Update metadata and optimized SEO
-   Updated Google Analytics to GA4
-   Updated robots.txt

**Security**:

-   Added Content Security Policy
-   Added Strict-Transport-Security

**Update**:

-   Updated packages
-   Updated service worker scripts

**Documentation**:

-   Added CI/CDs and GitHub Actions
-   Added Quynh (Cathy) Cao's GitHub URL
-   Change GitHub alias from ASully to AlexJSully
-   Prettified code and improved readability
-   Sorted uncategorized CSS styles to make them more readable
-   Updated README
-   Updated prettier to ignore line endings

**Bug fix**:

-   Fixed background size not being read correctly
-   Fixed being unable to switch login tabs
-   Fixed being unable to switch tabs on login
-   Fixed broken manifest
-   Fixed incorrect canonical URL on system run page
-   Fixed issue if load button does not exist, causes error
-   Fixed issue where loading genes no longer work
-   Fixed issue where maskable icons were not matching appropriate sizes
-   Fixed issue with Safari 10's iterator bug
-   Fixed spelling mistakes

## [1.0.7] - 2021-11-22

**A brand new version of the [SciGrade](https://scigrade.com/) has dropped!**

Version 1.0.7 has now dropped and it includes tons of optimizations and bug fixes

New features:
• Added favicons and metadata
• Add offline/caching service worker for instance if a user loses connection mid-usage
• Updated Google Analytics tracking options and added Google Tag Manager for bug tracking

Optimizations:
• Added code scanners
• Added robots.txt
• Image optimizations

Update:
• Updated jQuery to address a potential security issue
• Updated GitHub workflows to ignore packages folder

Documentation:
• Added missing/more documentation

Bug fix:
• Fixed typos
• Fixed spelling and grammar mistakes
• Fixed issue where students may be able to double submit an assignment due to it not clearing itself
• Fixed issue with ACTN3 (and all + strands) not coming out with the right marks
• Fixed issue where screen was not responsive on mobile
• Fixed issue where student's assignment options would not appear
• Fixed issue login button would cause an error
• Fixed the possibility of getting above 100% or less than 0% on an assignment
• Fixed bug where a student can receive over 100% in their assignments

## [1.0.0] - 2018-09-20

The official release of SciGrade is here! You can visit it and see all of it in action at https://scigrade.com/ or learn how it works by looking through our EDIT.MD code.

Enjoy learning with CRISPR on SciGrade!
-Alex

## [0.1.0] - 2018-09-07

The test build is now ready for use. A UI will come later once all functions have been tested and ready for public use.

All functions such as registration, class creation and marking student's inputs are now available on [SciGrade](http://scigrade.com/)
