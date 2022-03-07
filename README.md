# SharePoint Interactive Map Webpart

![GitHub release (latest by date)](https://img.shields.io/github/v/release/SPFxAppDev/sp-map-webpart)

The "Interactive Map" wepart for Microsoft Teams/SharePoint is a solution, that contains one webpart.

## Installation

1. Download the latest SharePoint Framework packages **spfxappdev-webparts-map.sppkg** from the [GitHub repository](https://github.com/SPFxAppDev/sp-map-webpart/releases).
2. Add **spfxappdev-webparts-map.sppkg** to the global tenant app catalog or a site collection app catalog. If you don't have an app catalog, follow this [procedure](https://docs.microsoft.com/en-us/sharepoint/use-app-catalog) to create one.

> * The packages are deployed in the general Office 365 CDN meaning **I do not host any code**.


> * For this package, you can choose to make the solution available in [all sites](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/tenant-scoped-deployment) or force to install an app to the site every time.

3. If the solution was not installed globally (available in all sites), install the app in the site
4. Add the webpart to a SharePoint Page or Teams Tab

![My interactive maps webpart](/docs/docs/images/MapWPOverview.gif)

## Configuration

[Visit the website](https://spfxappdev.github.io/sp-map-webpart/)
