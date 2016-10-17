# QlikSocial

UPDATE: Added support for Facebook - 10/17/2016

QlikSocial helps you create on demand analytics applications based on social media sources. The data is visualized and searchable to help sift through the comments and understand what is being said around a specific topic. QlikSocial allows you to take and store snapshots in time of topics and keep these apps for future access, for example around events, product launches etc.

QlikSocial is developed using Qlik Sense 3.0 and leveraging the Engine API with custom data visualizations.

QlikSocial should be used with __Qlik Sense Enterprise Server only__, i.e. no Qlik Sense Desktop.

Here's a youtube video that walks through the application and demonstrates how it can be used:
https://www.youtube.com/watch?v=33XhaIwRrhI

[![IMAGE ALT TEXT](https://img.youtube.com/vi/33XhaIwRrhI/0.jpg)](https://www.youtube.com/watch?v=33XhaIwRrhI "QlikSocial")

# Installation & Setup

![alt tag](https://raw.githubusercontent.com/johsund/QlikSocial/master/images/qlikSocialAnalyze.png)

## Prerequisities
  * Install __NodeJS__ - https://nodejs.org/en/download/
  * Install __QlikWebConnectors__ from the Qlik download page and license the product
  * Download __QlikSocial__ zip and unzip to directory of choice

## Configuration
  * Export Certificate
      * Go to Qlik Sense __QMC > Certificates__
      * Add machine name of your machine hosting QlikSocial
      * Export in __Windows format__
      * Go to __C:\ProgramData\Qlik\Sense\Repository\Exported Certificates\<hostname>__ and copy the __Client.pfx__ to QlikSocial root
      
![alt tag](https://raw.githubusercontent.com/johsund/QlikSocial/master/images/exportCerts.png)
  

  * Create Virtual Proxy
      * Go to Qlik Sense __QMC > Virtual Proxies__
      * Create a virtual proxy that uses Ticket authentication
      * Ensure the virtual proxy is linked to a proxy and load balances to the Qlik Sense engine.
      
![alt tag](https://raw.githubusercontent.com/johsund/QlikSocial/master/images/virtualProxy.png)
      

  * Configure QlikSocial
      * In QlikSocial root, open __config.js__ and update paths
          * host
          * virtualproxy
          * userdirectory
          * username (assign a CAL to this user in the QMC)
          
![alt tag](https://raw.githubusercontent.com/johsund/QlikSocial/master/images/jsConfig.png)


  * In the __public__ folder inside the QlikSocial root, open __app.js__ and __app_vis.js__ and edit the following
      * qlikHost (__app.js__ and __app_vis.js__)
      * qlikVirtualProxy (__app.js__ and __app_vis.js__) 
      * qlikWebConnectorHost (__app.js__)
          
![alt tag](https://raw.githubusercontent.com/johsund/QlikSocial/master/images/jsConfig2.png)
          
          
  * QlikWebConnector
      * Start QlikWebConnector and configure access to Twitter (login with Twitter account)

![alt tag](https://raw.githubusercontent.com/johsund/QlikSocial/master/images/configureTwitter.png)
  
      * Configure access to Facebook (login with Facebook account)
      
![alt tag](https://raw.githubusercontent.com/johsund/QlikSocial/master/images/configureFB.png)      
      
      
## Starting QlikSocial
  * Navigate to your QlikSocial folder root
  * Launch __QlikSocial.bat__
  * Ensure that you can see the below screen (App launched on port 3000)
  
![alt tag](https://raw.githubusercontent.com/johsund/QlikSocial/master/images/nodeJScommandPrompt.png)
  

## Using QlikSocial  
  * Go to __http://localhost:3000__
  * Do note that in order for Facebook to work you need to use __http://localhost:3000__ to access. This is because Facebook has a callback function after authenticating/checking user credentials so it will send the access token back to this location. If you use http://hostname:3000 the facebook token will not return properly and you'll be unable to include Facebook data in the search.
  
![alt tag](https://raw.githubusercontent.com/johsund/QlikSocial/master/images/qlikSocialStart.png)

  * When clicking the Facebook checkbox for the first time- you will be prompted via a popup to authenticate with Facebook. Ensure the popup is not blocked by an ad-blocker.
  
  * The facebook page search is __optional__. If you just use the normal QlikSocial search, the first hit from Facebook will be returned. For example, you might search for __apple__ and the first Facebook page is a page with lots of posts around apples, the fruit. In reality you were looking for __apple__ the software company. Use the search in the Facebook box to ensure you're looking for the correct topic when searching in QlikSocial.
  
## Extra options
  * You have the option to change the color scheme from the standard QlikSocial green.
  * Open the colorstyler.css file and change the top 2 variables:
     --main-color: #449d44;
     --main-hover-color: #116a11;
  
![alt tag](https://raw.githubusercontent.com/johsund/QlikSocial/master/images/colorStyling.png) 

# Acknowledgements
* Thanks to Alex Karlsson ([@Mindspank](https://github.com/mindspank)) for qSocks and projects like Sense-It & Diplomatic Pulse.
* Thanks to Nick Webster ([@websy85](https://github.com/websy85)) for the sense-search-components.
* Thanks to Speros Kokenes ([@skokenes](https://github.com/skokenes)) for the D3-lasso-plugin.
