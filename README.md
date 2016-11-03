# Adidas Variants
Variant management directive for use across adidas applications.
- - - -
###Installation
#####1) Install with bower
`bower install git@github.com:dev6jordan/adi-variants.git --save`
#####2) Add 'adidas.variants' as a dependency to the application
`angular.module('myApp', ['adidas.variants']);`

- - - -
###Directive use example
`<variants params="model.searchParams" userid="model.userID" app-name="'AI'" main-loader="model.showProgress" sessionid="model.sessionId" usertype="model.userType" loaddefault="loadDefault"></variants>`        

**1) params** -> List of application / report params that are to be updated and saved via variant system    
**2) userid** -> User ID of current logged in user    
**3) app-name** -> Shorthand of current application or report:

Value  | App Name
------------- | -------------
'AI'          | Account Inquiry
'UPC'         | UPC Download
'ST'          | Shipment Tracking
'OT'          | Order Tracking
'B2B'         | B2B Orders    
**5) usertype** -> User type of current logged in user    
**6) main-loader** -> Loading spinner boolean for main application    
**7) sessionid** ->  Session ID of current user    
**8) loaddefault** -> A boolean to determine whether the service should load the user's defaulted search if available    
- - - -

###Functionality
The variant management system provides users with the ability to save and load search presets based on their own preferences or 
the preferences of other users. If a user decides to save their own variant based on their current search settings, the system will 
check to see if this is a variant that has already been created and loaded by that user. If it already exists, the user is provided with
a prompt which allows them to overwrite the current variant. If they decline, a modal is provided with the following fields: 

- **Variant Name** -> An identifier for loading this variant in the future 
- **Description** -> A short description of what the variant entails 
- **Share with Accounts** -> This option is only available for sales reps. It provides the opportunity for sales reps to share with all of their accounts if they leave the input box blank, or they can add a selection of accounts. They can do this by either manually inputting the accounts, or they can click the search icon and add/remove accounts via the lookup screen. 
- **Set as Default** -> Choose whether to make this the default saved search that is loaded when the user re-visits the application 

If no variant has been loaded or if the user has loaded a variant created by another user, they are not prompted to overwrite the 
variant and are immediately directed to the variant save modal.

If a user clicks the variant lookup icon, a modal is provided with a list of all public variants for the current application. 
The user can search for a variant via the following fields:

- **Search Name** -> The name of the variant 
- **Description** -> The variant's description 
- **Only my Searches** -> Filter only the current user's created searches 
- **Created By** -> The user who created the variant

The list is immediately filtered based on the user's search preferences. The user can click on the 'select' button to load that variant's
search parameters into the current application search screen.


###Error / Success Messages

Upon error or success of certain actions, adi-variants emits two events:

**1) variantSuccessAlert** -> Emitted when an action has been completed successfully    
**2) variantErrorAlert** -> Emitted when an action has not been completed successfully    
e.g.:    
`$rootScope.$on('variantSuccessAlert', function (event, message) { alert(message)  });`
