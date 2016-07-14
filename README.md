# QlikSocial
Social Media on demand app generator for Qlik Sense

# Installation & Setup

## Prerequisities
  * Install NodeJS - https://nodejs.org/en/download/
  * Install QlikWebConnectors
  * Download QlikSocial zip and unzip to directory of choice

## Configuration
  * Export Certificate
      * Go to Qlik Sense __QMC > Certificates__
      * Add machine name of your machine hosting QlikSocial
      * Export in __Windows format__
      * Go to __C:\ProgramData\Qlik\Sense\Repository\Exported Certificates\<hostname>__ and copy the __Client.pfx__ to QlikSocial root
  
  * Create Virtual Proxy
      * Go to Qlik Sense __QMC > Virtual Proxies__
      * Create a virtual proxy that uses Ticket authentication
      
  * Configure QlikSocial
      * In QlikSocial root, open __config.js__ and update paths
          * host
          * virtualproxy
          * userdirectory
          * username (assign a CAL to this user in the QMC)
      * In the "public" folder, open __app.js__ and __app_vis.js__ and edit the following
          * qlikHost (both files)
          * qlikVirtualProxy (both files) 
          * qlikWebConnectorHost (app.js)
          
  * QlikWebConnector
      * Start QlikWebConnector and configure access to Twitter (login with Twitter account)
      
## Starting QlikSocial
  * Start the NodeJS Command Prompt from the Windows Start menu.
  * Navigate to your QlikSocial folder root
  * Type: __node index.js__
  
## Using QlikSocial  
  * Go to __http://localhost:3000__
