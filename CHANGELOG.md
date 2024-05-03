# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/) and this project adheres to [Semantic Versioning](http://semver.org/).

To see tags and releases, please go to [Tags](https://github.com/AlexJSully/SciGrade/tags) on [GitHub](https://github.com/AlexJSully/SciGrade).

## [1.2.0] - 2024-05-02

🔬 **SciGrade Online Features Depreciation Notice**

Dear SciGrade Community,

With heartfelt gratitude, I extend my deepest thanks to each and every one of you who has been a part of the SciGrade journey. From its release on September 20, 2018, to today, May 2, 2024, witnessing students and enthusiasts alike utilize SciGrade to learn about CRISPR gRNA+Primer sequence generation has been nothing short of awe-inspiring.

After careful consideration, I've made the difficult decision to depreciate the online features of SciGrade, including account management, class functionalities, and access to the database. As the landscape of technology evolves, so too must our applications. Reflecting on the growth I've experienced as a developer since SciGrade's inception, it became evident that significant enhancements, spanning from UI refinements to bolstered security measures, are imperative to uphold the highest standards of user experience and data protection.

However, I assure you that the SciGrade website and web app will remain accessible at [scigrade.com](https://scigrade.com/). Regrettably, access to class features will cease, and in adherence to our commitment to user privacy, all associated data has been promptly deleted.

To all our users, past and present, I extend my sincerest appreciation for your unwavering support and enthusiasm. Your engagement has been the driving force behind SciGrade's evolution, and for that, I am profoundly grateful.

Thank you, from the depths of my heart, for being part of the SciGrade community.

-[Alexander Joo-Hyun Sullivan](https://twitter.com/alexjsully)

---

Depreciation:

-   Depreciated online features, including account management, class functionalities, and access to the database

Optimization:

-   Added an `npm run start` command to launch SciGrade faster
-   Updated GitHub Actions

Update:

-   Update ESLint to v9
-   Update Sentry version
-   Update packages
-   Update service worker files

Documentation:

-   Update public facing email

Bug fix:

-   Fixed too many Sentry CDN error

## [1.1.2] - 2024-01-04

Update:

-   Update Sentry version
-   Update packages

Bug fix:

-   Fixed checking possible correct answers returning null
-   Fixed issue where if no student information was present, would prevent further use of SciGrade
-   Fixed issue where service worker would try and register before browser was ready or if the browser did not support service workers

## [1.1.1] - 2023-08-03

No longer supports Internet Explorer.

Optimization:

-   Added ESLint
-   Optimized images
-   Updated web manifest

Update:

-   Updated OSSAR workflow
-   Updated packages

Bug fixes:

-   Fixed CaptureConsole not found and unable to call CaptureConsole
-   Fixed TypeError cannot read undefined 0
-   Fixed unable to open or close account modal
-   Fixed wrong version of Sentry offline integrations

## [1.1.0] - 2022-11-03

A brand new version of the [SciGrade](https://scigrade.com/) has dropped!

Version 1.1.0 has now dropped and it includes the ability to do practice genes without an account as well as optimizations and bug fixes.

Feature:

-   Can now do practice genes without an account

Optimization:

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

Security:

-   Added Content Security Policy
-   Added Strict-Transport-Security

Update:

-   Updated packages
-   Updated service worker scripts

Documentation:

-   Added CI/CDs and GitHub Actions
-   Added Quynh (Cathy) Cao's GitHub URL
-   Change GitHub alias from ASully to AlexJSully
-   Prettified code and improved readability
-   Sorted uncategorized CSS styles to make them more readable
-   Updated README
-   Updated prettier to ignore line endings

Bug fix:

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

A brand new version of the [SciGrade](https://scigrade.com/) has dropped!

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
