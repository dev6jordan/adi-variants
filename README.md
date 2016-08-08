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
`<variants params="model.searchParams" userid="model.userID" app-name="'AI'" main-loader="model.showProgress" sessionid="sessionID" userType="model.userType"></variants>`        

**1) params** -> List of application / report params that are to be updated and saved via variant system    
**2) userid** -> User ID of current logged in user    
**3) app-name** -> Shorthand of current application or report...
**4) user-type** -> User type of current logged in user

Value  | App Name
------------- | -------------
'AI'          | Account Inquiry
'UPC'         | UPC Download
'ST'          | Shipment Tracking
'OT'          | Order Tracking
'B2B'         | B2B Orders    
**4) main-loader** -> Loading spinner boolean for main application
- - - -

###Functionality
The variant management system provides users with the ability to save and load search presets based on their own preferences or 
the preferences of other users. If a user decides to save their own variant based on their current search settings, the system will 
check to see if this is a variant that has already been created and loaded by that user. If it already exists, the user is provided with
a prompt which allows them to overwrite the current variant. If they decline, a modal is provided with the following fields: 

- **Variant Name** -> An identifier for loading this variant in the future    
- **Description** -> A short description of what the variant entails    
- **Make Public** -> A boolean which will either make this variant public to other users, or private to only be used by that user  

If no variant has been loaded or if the user has loaded a variant created by another user, they are not prompted to overwrite the 
variant and are immediately directed to the variant save modal.

If a user clicks the variant lookup icon, a modal is provided with a list of all public variants for the current application. 
The user can search for a variant via the following fields:

- **Variant Name** -> The name of the variant
- **Description** -> The variant's description
- **User** -> The user who created the variant

The list is immediately filtered based on the user's search preferences. The user can click on the 'select' button to load that variant's
search parameters into the current application search screen.


###Error / Success Messages

Upon error or success of certain actions, adi-variants emits two events:

**1) variantSuccessAlert** -> Emitted when an action has been completed successfully    
**2) variantErrorAlert** -> Emitted when an action has not been completed successfully    
e.g.:    
`$rootScope.$on('variantSuccessAlert', function (event, message) { alert(message)  });`
