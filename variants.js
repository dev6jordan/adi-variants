'use strict';
angular.module('adidas.variants', []);

angular.module('adidas.variants')
  .directive('variants', function () {
    return {
      template: '<div class="variant-wrapper"><a><span class="glyphicon glyphicon-floppy-disk variant-icon" ng-disabled="isSaveDisabled()" ng-class="{\'variant-icon-disabled\':isSaveDisabled()}" ng-click="save()" title="Save Search to Favorites"></span></a><a><span class="glyphicon glyphicon-search variant-icon" ng-click="loadVariants()" title="Favorite Search Lookup"></span></a></div>',
      restrict: 'E',
      scope: {
        params: '=',
        userid: '=',
        appName: '=',
        mainLoader: '=',
        usertype: '=',
        loaddefault: '=',
        brand: '='
      },
      controller: function ($scope, $modal, $timeout, VariantService, $rootScope, $window) {
        $scope.saveDisabled = true;
        $scope.variant = [];
        $scope.showProgress = false;
        $scope.allVariants = [];
        $scope.defaultVariant = '';
        $scope.initialParams = '';

        $scope.init = function () {
          $scope.initialParams = angular.copy($scope.params);

          $timeout(function () {
            if ($scope.loaddefault) {
              VariantService.getDefaultVariant($scope.appName)
                .then(function success (response) {
                  var res = eval(response.data);
                  if (res.length > 0) {
                    _.each(res, function (value, key) {
                        _.each(value.params, function (resVal, resKey) {
                          if (resKey !== 'orderDateFrom' && resKey !== 'orderDateTo' && resKey !== 'reqShipDateFrom' && resKey !== 'reqShipDateTo' && resKey !== 'cancelDateFrom' && resKey !== 'cancelDateTo' && resKey !== 'invoiceDateFrom' && resKey !== 'invoiceDateTo' && resKey !== 'OrderDateTo' && resKey !== 'OrderDateFrom' && resKey !== 'shipDateFrom' && resKey !== 'shipDateTo' && resKey !== 'CancelDateFrom' && resKey !== 'CancelDateTo') {
                            // if (resKey !== 'brand' && $scope.appName === 'OT') {}
                            if ($scope.appName === 'OT') {
                              if (resKey!== 'brand') {
                                $scope.params[resKey] = resVal;
                              }
                            } else {
                              $scope.params[resKey] = resVal;
                            }
                          }
                          if (resKey === 'orderDateFrom' || resKey === 'orderDateTo' || resKey === 'reqShipDateFrom' || resKey === 'reqShipDateTo' || resKey === 'cancelDateFrom' || resKey === 'cancelDateTo' || resKey === 'invoiceDateFrom' || resKey === 'invoiceDateTo' || resKey === 'OrderDateTo' || resKey === 'OrderDateFrom' || resKey === 'shipDateFrom' || resKey === 'shipDateTo' || resKey === 'CancelDateFrom' || resKey === 'CancelDateTo') {
                            if (resVal !== null) {
                              $scope.params[resKey] = new Date(resVal);
                            }
                          }
                        });
                    });
                    $scope.defaultVariant = res[0].id;
                    $timeout(function() {
                      $rootScope.$emit('variantSelected');
                      $scope.$apply();
                    });
                  }
                }, function err () {
                  console.log('The system is busy and could not retrieve the default search. Please try again later.');
                });
            }
            });
        };

        $scope.getDefault = function () {
          VariantService.getDefaultVariant($scope.appName)
              .then(function success (response) {
                var res = eval(response.data);
                if (res.length > 0) {
                  _.each(res, function (value, key) {
                      _.each(value.params, function (resVal, resKey) {
                        if (resKey !== 'orderDateFrom' && resKey !== 'orderDateTo' && resKey !== 'reqShipDateFrom' && resKey !== 'reqShipDateTo' && resKey !== 'cancelDateFrom' && resKey !== 'cancelDateTo' && resKey !== 'invoiceDateFrom' && resKey !== 'invoiceDateTo' && resKey !== 'OrderDateTo' && resKey !== 'OrderDateFrom' && resKey !== 'shipDateFrom' && resKey !== 'shipDateTo' && resKey !== 'CancelDateFrom' && resKey !== 'CancelDateTo') {
                          $scope.params[resKey] = resVal;
                        }
                      });
                  });
                  $scope.defaultVariant = res[0].id;
                }
              }, function err () {
                console.log('The system is busy and could not retrieve the default search. Please try again later.');
              });
        };

        $scope.save = function () {
          if ($scope.saveDisabled) {
            return;
          }
          // If already exists...
          if (($scope.userid === $scope.variant.createdBy) && $scope.variant.id!=='') {
            var confirmOverwrite = (confirm('Would you like to overwrite the current search?'));
            if (confirmOverwrite) {
              $scope.mainLoader = true;
              $scope.variant.params = $scope.params;
              VariantService.updateVariant($scope.appName, $scope.variant.id, $scope.variant, '')
                .then(function success (response) {
                  $rootScope.$emit('variantSuccessAlert', 'Search has been saved successfully.');
                  $scope.mainLoader = false;
                }, function err (response) {
                  $rootScope.$emit('variantErrorAlert', 'Search could not be saved.');
                  $scope.mainLoader = false;
                });
            } else {
              $scope.openVariantConfig();
            }
          } else {
            $scope.openVariantConfig();
          }
        };

        $scope.openVariantConfig = function () {
          var loadInstance = $modal.open({
            template: '<div class="modal-header"> <div ng-click="close()" class="close">X</div><div class="modal-title"> <h3 class="modal-title">Save Search to Favorites</h3> </div></div><div class="modal-body variant-container"> <adi-progress-bar ng-show="false"></adi-progress-bar> <div ng-show="hasError" class="alert alert-danger" role="alert" align="center"> Unable to save search at this time. </div><ul> <li> <label for="">Search Name</label> <input name="VARIANT" type="text" size="30" maxlength="30" ng-model="model.name" class="search-field-modal match-input-width"> </li><li> <label for="">Description</label> <input name="DESCRIPTION" type="text" size="30" maxlength="100" ng-model="model.description" class="search-field-modal match-input-width"> </li><li class="variant-make-public" ng-if="userType !==\'C\'"> <label for="">Share With Accounts</label> <label for="PUBLIC_Y"> <input id="PUBLIC_Y" type="radio" ng-model="model.isPublic" ng-value="\'Y\'">Yes</label> <label for="PUBLIC_N"> <input id="PUBLIC_N" type="radio" ng-model="model.isPublic" ng-value="\'N\'" ng-click="model.userid=\'\'">No </label> <br><label for="" class="userid-field sold-to-field" ng-show="model.isPublic===\'Y\'"><img ng-hide="userType===\'C\'" src="images/search-icon.png" height="20" width="20" alt="" ng-click="openUserList()">Sold-To # (Optional)</label> <textarea name="USERID" type="text" size="30" ng-model="model.userId" class="search-field-modal userid-input" ng-show="model.isPublic===\'Y\'" ng-blur="formatAccounts()"></textarea> <p ng-if="model.isPublic===\'Y\'" style="font-weight: bold" class="account-message">You may select up to 100 accounts. If you do not select any accounts in the list, the search will be shared with all of your accounts.</p><!-- <label for="" class="userid-field" ng-show="model.isPublic===\'Y\'"><img ng-hide="userType===\'C\'" src="images/search-icon.png" height="20" width="20" alt="" ng-click="openUserList()">Ship-To # (Optional)</label> <textarea name="USERID" type="text" size="30" maxlength="10" ng-model="model.userId" class="search-field-modal userid-input" ng-show="model.isPublic===\'Y\'" ng-disabled="true"></textarea> <div class="col-xs-12"> <p ng-if="model.isPublic===\'Y\'" style="font-weight: bold">You may select up to 100 accounts. If you do not select any accounts in the list, the search will be shared with all of your accounts.</p></div>--> </li><li class="variant-make-public"> <label for="">Set as Default</label> <label for="DEFAULT_Y"> <input id="DEFAULT_Y" type="radio" ng-model="model.isDefault" ng-value="\'Y\'">Yes</label> <label for="DEFAULT_N"> <input id="DEFAULT_N" type="radio" ng-model="model.isDefault" ng-value="\'N\'">No </label> </li></ul></div><div class="modal-footer"> <div style="padding-top:15px"> <button ng-click="saveVariant()" class="bottombuttons" ng-class="{\'disabled-save\': (model.name===\'\' || model.description===\'\')}" ng-disabled="model.name===\'\' || model.description===\'\'">Save</button> <button ng-click="close()" class="bottombuttons">Close</button> </div></div>',
            controller: 'VariantConfigCtrl',
            size: 'md',
            resolve: {
              params: function () {
                return $scope.params;
              },
              userid: function () {
                return $scope.userid;
              },
              appName: function () {
                return $scope.appName;
              },
              mainLoader: function () {
                return $scope.mainLoader;
              },
              userType: function () {
                return $scope.usertype;
              },
              brand: function () {
                return $scope.brand;
              }
            }
          });

          loadInstance.result.then(function (response) {
            if (response !== undefined) {
              $scope.variant = eval(response.data)[0];
              $rootScope.$emit('variantSuccessAlert', 'Search has been saved successfully.');
            }
          }, function err () {
            // Modal closed via backdrop click
          });
        };

        $scope.loadVariants = function () {
          $scope.mainLoader = true;
          VariantService.getVariantList($scope.appName)
              .then(function success (response) {
                $scope.allVariants = eval(response.data);
                for (var i=0; i<$scope.allVariants.length; i++) {
                  $scope.allVariants[i].lastModified = $scope.date2String($scope.allVariants[i].lastModified);
                }
                $scope.mainLoader = false;
                var loadInstance = $modal.open({
                  template: '<div class="modal-header"> <div ng-click="close()" class="close">X</div><div class="modal-title"> <h3 class="modal-title">Favorite Search Lookup</h3> </div></div><div class="modal-body variant-container"> <div ng-show="hasError" class="alert alert-danger" role="alert" align="center">{{errorMsg}}</div><div ng-show="hasSuccess" class="alert alert-success" role="alert" align="center">{{successMsg}}</div><div class="col-md-6 shiptocontainer desktop"> <form class="modal-form shiptoform leftvariantform"> <div> <label for="">Search Name</label> <input name="VARIANT" type="text" size="30" maxlength="100" ng-model="model.name" ng-change="searchList()"> </div><div> <label for="">Description</label> <input name="DESCRIPTION" type="text" size="30" maxlength="100" ng-model="model.description" ng-change="searchList()"> </div></form> </div><div class="col-md-6 namecontainer desktop"> <form class="modal-form nameform rightvariantform"> <div class="onlyMySearches"> <label for="" class="breakLine">Only My Searches</label> <label for="PUBLIC_Y" class="push-right"> <input id="PUBLIC_Y" type="radio" ng-model="onlyMine" ng-value="true" ng-change="searchList()">Yes</label> <label for="PUBLIC_N"> <input id="PUBLIC_N" type="radio" ng-model="onlyMine" ng-value="false" ng-change="searchList()">No </label> </div><div ng-if="!onlyMine"> <label for="">Created By</label> <input name="USER" id="onlyMineUser"value="" size="30" maxlength="50" type="text" ng-model="model.userID" ng-change="searchList()"> </div></form> </div></div><div class="modal-footer"> <div style="padding-top:15px" class="desktop"> <pagination ng-change="pageChange()" total-items="model.filteredList.length" ng-model="model.currentPage" items-per-page="model.pageSize" max-size="model.pagesToShow" boundary-links="true" class="pagination-group" ng-hide="model.filteredList.length<=0 || model.filteredList.length<=model.pageSize"></pagination> </div><div class="mobile"> <pagination ng-change="pageChange()" total-items="model.filteredList.length" ng-model="model.currentPage" items-per-page="model.pageSize" max-size="model.pagesToShow" boundary-links="false" class="pagination-group" ng-hide="model.filteredList.length<=0 || model.filteredList.length<=model.pageSize" previous-text="&lsaquo;" next-text="&rsaquo;"></pagination> </div><table border="1" ng-hide="model.filteredList.length===0" class="variantResultList"> <thead> <tr> <th> <a href="" ng-click="order(\'variantName\')" class="sort-link">Search Name</a> <span class="sortorder" ng-show="predicate===\'variantName\'" ng-class="{reverse:reverse}"></span> </th> <th> <a href="" ng-click="order(\'variantDsc\')" class="sort-link">Description</a> <span class="sortorder" ng-show="predicate===\'variantDsc\'" ng-class="{reverse:reverse}"></span> </th> <th> <a href="" ng-click="order(\'createdBy\')" class="sort-link">Created By</a> <span class="sortorder" ng-show="predicate===\'createdBy\'" ng-class="{reverse:reverse}"></span> </th> <th> <a href="" ng-click="order(\'lastModified\')" class="sort-link">Last Modified</a> <span class="sortorder" ng-show="predicate===\'lastModified\'" ng-class="{reverse:reverse}"></span> </th> <th>Default</th> <th>Action</th> </tr></thead> <tbody> <tr ng-repeat="variant in model.filteredList | orderBy:[predicate, \'variantName\']:reverse | limitTo:model.pageSize:model.beginFrom"> <td>{{variant.variantName}}</td><td>{{variant.variantDsc}}</td><td>{{variant.createdBy}}</td><td>{{variant.lastModified}}</td><td><input name="{{variant.id}}Default" id="{{variant.id}}Default" ng-model="isDefault" type="radio" ng-checked="checkIsDefault(variant.id)" class="isDefaultRadio" ng-click="makeDefault(variant)" ng-if="variant.createdBy===userid"><label for="{{variant.id}}Default" ng-if="variant.createdBy===userid">Set default</label></td><td><a ng-click="selectVariant(variant)" style="cursor: pointer">Select</a><br><a ng-click="editVariant(variant)" style="cursor: pointer" ng-if="variant.createdBy===userid">Edit</a><br><a ng-click="deleteVariant(variant)" style="cursor: pointer" ng-if="variant.createdBy===userid">Delete</a><br></td></tr></tbody> </table> <div class="desktop"> <pagination ng-change="pageChange()" total-items="model.filteredList.length" ng-model="model.currentPage" items-per-page="model.pageSize" max-size="model.pagesToShow" boundary-links="true" class="pagination-group" ng-hide="model.filteredList.length<=0 || model.filteredList.length<=model.pageSize"></pagination> </div><div class="mobile"> <pagination ng-change="pageChange()" total-items="model.filteredList.length" ng-model="model.currentPage" items-per-page="model.pageSize" max-size="model.pagesToShow" boundary-links="false" class="pagination-group" ng-hide="model.filteredList.length<=0 || model.filteredList.length<=model.pageSize" previous-text="&lsaquo;" next-text="&rsaquo;"></pagination> </div></div>',
                  controller: 'VariantCtrl',
                  size: 'lg',
                  resolve: {
                    variants: function () {
                      return $scope.allVariants;
                    },
                    defaultVariant: function () {
                      return $scope.defaultVariant;
                    },
                    params: function () {
                      return $scope.params;
                    },
                    defaultParams: function () {
                      return $scope.initialParams;
                    },
                    userid: function () {
                      return $scope.userid;
                    },
                    appName: function () {
                      return $scope.appName;
                    },
                    brand: function () {
                      return $scope.brand;
                    },
                    userType: function () {
                      return $scope.usertype;
                    }
                  }
                });

                loadInstance.result.then(function (variant) {
                  if (variant !== undefined) {
                    _.each(variant.params, function (resVal, resKey) {
                      if (resKey !== 'orderDateFrom' && resKey !== 'orderDateTo' && resKey !== 'reqShipDateFrom' && resKey !== 'reqShipDateTo' && resKey !== 'cancelDateFrom' && resKey !== 'cancelDateTo' && resKey !== 'invoiceDateFrom' && resKey !== 'invoiceDateTo' && resKey !== 'OrderDateTo' && resKey !== 'OrderDateFrom' && resKey !== 'shipDateFrom' && resKey !== 'shipDateTo' && resKey !== 'CancelDateFrom' && resKey !== 'CancelDateTo') {
                        // if (resKey !== 'brand' && $scope.appName === 'OT') {}
                        if ($scope.appName === 'OT') {
                          if (resKey!== 'brand') {
                            $scope.params[resKey] = resVal;
                          }
                        } else {
                          $scope.params[resKey] = resVal;
                        }
                      }
                      if (resKey === 'orderDateFrom' || resKey === 'orderDateTo' || resKey === 'reqShipDateFrom' || resKey === 'reqShipDateTo' || resKey === 'cancelDateFrom' || resKey === 'cancelDateTo' || resKey === 'invoiceDateFrom' || resKey === 'invoiceDateTo' || resKey === 'OrderDateTo' || resKey === 'OrderDateFrom' || resKey === 'shipDateFrom' || resKey === 'shipDateTo' || resKey === 'CancelDateFrom' || resKey === 'CancelDateTo') {
                        if (resVal !== null) {
                          $scope.params[resKey] = new Date(resVal);
                        }
                      }
                    });
                    // $scope.params = variant.params;
                    $scope.variant = variant;
                    $timeout(function () {
                      $scope.$apply();
                      $rootScope.$emit('variantSelected');
                    });
                  }
                }, function err () {
                  // Modal closed via backdrop click
                });
              }, function err () {
                console.log('The system is busy and could not retrieve the list of searches. Please try again later.');
              });
        };

        $scope.isSaveDisabled = function () {
          return $scope.saveDisabled;
        };

        $scope.date2String = function (date) {
          if(date===undefined || date==='' || date === '0'){
            return '';
          }
          return date.slice(4,6) + '/' + date.slice(6,8) + '/' + date.slice(0,4);
        };

        $timeout(function () {
          $scope.$watch(function () {return $scope.params}, function (newV, oldV) {
            if (newV !== oldV) {
              $scope.saveDisabled = false;
            }
          }, true);

          $scope.$watch(function () {return $scope.loaddefault}, function (newV, oldV) {
            if (newV === true) {
              $scope.getDefault();
            }
          });
        });

        $rootScope.$on('getUpdatedVariants', function () {
          $scope.loadVariants();
        });


        $scope.init();
      }
    };
  });

  angular.module('adidas.variants')
    .controller('VariantCtrl', function ($scope, params, defaultParams, userid, appName, variants, defaultVariant, VariantService, $window, $filter, $modalInstance, $timeout, $modal, brand, $rootScope, userType) {
      $scope.params = params;
      $scope.userid = userid;
      $scope.appName = appName;
      $scope.brand = brand;
      $scope.showProgress = false;
      $scope.results = '';
      $scope.hasError = false;
      $scope.errorMsg = '';
      $scope.onlyMine = false;
      $scope.model = {
        name: '',
        description: '',
        userID: '',
        filterBy: 'All',
        currentPage: 1,
        pageSize: 20,
        pagesToShow: 5,
        beginFrom: 0,
        filteredList: []
      };
      $scope.isDefault = '';
      $scope.predicate = 'lastModified';
      $scope.reverse = true;
      $scope.resultsCopy = '';
      $scope.userType = userType;

      $scope.init = function () {
        console.log('USER ID IN VARIANT: ', $scope.userid);
        $scope.showProgress = true;
        $scope.results = variants;
        $scope.isDefault = defaultVariant;
        $scope.searchList();
      };

      $scope.editVariant = '';

      $scope.pageChange = function () {
        $window.scrollTo(0, 0);

        var changePage = ($scope.model.currentPage * $scope.model.pageSize) - $scope.model.pageSize;
        $scope.model.beginFrom = changePage;
      };

      $scope.searchList = function () {
        var nameUpper = $scope.model.name.toUpperCase();
        var descriptionUpper = $scope.model.description.toUpperCase();
        var userIdUpper = $scope.model.userID.toUpperCase();
        if ($scope.onlyMine) {
          $scope.model.userID = '';
          userIdUpper = userid.toUpperCase();
        }

        $scope.model.filteredList = $filter('filter')($scope.results, function (item) {
            if(item.variantName.toUpperCase().indexOf(nameUpper) !== -1 && item.createdBy.toUpperCase().indexOf(userIdUpper) !== -1 && item.variantDsc.toUpperCase().indexOf(descriptionUpper) !== -1){
                return true;
            } else {
                return false;
            }
        });
      };

      $scope.order = function (predicate) {
        var results = $scope.model.filteredList;

        $scope.reverse = ($scope.predicate === predicate) ? !$scope.reverse : false;
        $scope.predicate = predicate;
        $scope.model.currentPage = 1;
        $scope.model.beginFrom = 0;
        var orderBy = $filter('orderBy');
        $scope.results = orderBy(results, 'createdBy', $scope.reverse);

        $scope.searchList();  
      };

      $scope.selectVariant = function (variant) {
        var variantCopy = variant;
        variantCopy.soldToList = defaultParams.soldToList;
        $scope.close(variantCopy);
      };

      $scope.makeDefault = function (variant) {
        $scope.isDefault = '';
        $scope.showProgress = true;

        VariantService.updateVariant(appName, variant.id, variant, 'Y')
          .then(function success (response) {
            $scope.hasSuccess = true;
            $scope.showProgress = false;
            $window.scrollTo(0,0);
            $scope.successMsg = 'Search has been set as your default.';
            $scope.isDefault = variant.id;
            $timeout(function () {
              $scope.hasSuccess = false;
              $scope.successMsg = '';
            }, 3000);
          }, function err (response) {
            $scope.isDefault = variant.id;
            $scope.showProgress = false;
            $scope.hasError = true;
            $window.scrollTo(0,0);
            $scope.errorMsg = 'Search could not be set as your default.';
          });
      };

      $scope.editVariant = function (toEdit) {
        var loadInstance = $modal.open({
            template: '<div class="modal-header"> <div ng-click="close()" class="close">X</div><div class="modal-title"> <h3 class="modal-title">Update Saved Search Settings</h3> </div></div><div class="modal-body variant-container"> <adi-progress-bar ng-show="false"></adi-progress-bar> <div ng-show="hasError" class="alert alert-danger" role="alert" align="center"> Unable to save search at this time. </div><ul> <li> <label for="">Search Name</label> <input name="VARIANT" type="text" size="30" maxlength="30" ng-model="model.name" class="search-field-modal match-input-width"> </li><li> <label for="">Description</label> <input name="DESCRIPTION" type="text" size="30" maxlength="100" ng-model="model.description" class="search-field-modal match-input-width"> </li><li class="variant-make-public" ng-if="userType !==\'C\'"> <label for="">Share With Accounts</label> <label for="PUBLIC_Y"> <input id="PUBLIC_Y" type="radio" ng-model="model.isPublic" ng-value="\'Y\'">Yes</label> <label for="PUBLIC_N"> <input id="PUBLIC_N" type="radio" ng-model="model.isPublic" ng-value="\'N\'" ng-click="model.userid=\'\'">No </label> <br><label for="" class="userid-field sold-to-field" ng-show="model.isPublic===\'Y\'"><img ng-hide="userType===\'C\'" src="images/search-icon.png" height="20" width="20" alt="" ng-click="openUserList()">Sold-To # (Optional)</label> <textarea name="USERID" type="text" size="30" ng-model="model.userId" class="search-field-modal userid-input" ng-show="model.isPublic===\'Y\'" ng-blur="formatAccounts()"></textarea> <p ng-if="model.isPublic===\'Y\'" style="font-weight: bold" class="account-message">You may select up to 100 accounts. If you do not select any accounts in the list, the search will be shared with all of your accounts.</p></li><li class="variant-make-public"> <label for="">Set as Default</label> <label for="DEFAULT_Y"> <input id="DEFAULT_Y" type="radio" ng-model="model.isDefault" ng-value="\'Y\'">Yes</label> <label for="DEFAULT_N"> <input id="DEFAULT_N" type="radio" ng-model="model.isDefault" ng-value="\'N\'">No </label> </li></ul></div><div class="modal-footer"> <div style="padding-top:15px"> <button ng-click="saveVariant()" class="bottombuttons" ng-class="{\'disabled-save\': (model.name===\'\' || model.description===\'\')}" ng-disabled="model.name===\'\' || model.description===\'\'">Save</button> <button ng-click="close()" class="bottombuttons">Close</button> </div></div>',
            controller: 'EditVariantCtrl',
            size: 'md',
            resolve: {
              params: function () {
                return $scope.params;
              },
              userid: function () {
                return $scope.userid;
              },
              appName: function () {
                return $scope.appName;
              },
              mainLoader: function () {
                return $scope.mainLoader;
              },
              userType: function () {
                return $scope.userType;
              },
              editVariant: function () {
                return toEdit;
              },
              brand: function () {
                return $scope.brand;
              },
              chosenItems: function () {
                return toEdit.users;
              }
            }
          });

          loadInstance.result.then(function (response) {
            // THIS IS WHERE WE NEED TO RETRIEVE UPDATED VARIANTS
            $rootScope.$emit('getUpdatedVariants');
          }, function err (response) {
            // Modal closed via backdrop click
          });
      };

      $scope.checkIsDefault = function (id) {
        if (id === $scope.isDefault) {
          return true;
        } else {
          return false;
        }
      };

      $scope.deleteVariant = function (variant) {
        $scope.showProgress = true;
        var confirmation = confirm('Are you sure you want to delete this search?');
        if (confirmation) {
          VariantService.deleteVariant(appName, variant)
            .then(function success (response) {
              VariantService.getVariantList(appName)
                .then(function success (response) {
                  $scope.results = eval(response.data);
                  $scope.searchList();
                  $scope.hasSuccess = true;
                  $scope.successMsg = 'Search has been successfully deleted.';
                  $scope.showProgress = false;
                  $timeout(function () {
                    $scope.successMsg = '';
                    $scope.hasSuccess = false;
                  }, 3000);
                })
            }, function err (response) {
              $scope.hasError = true;
              $scope.errorMsg = response.msg;
              $scope.showProgress = false;
              $timeout(function () {
                $scope.errorMsg = '';
                $scope.hasError = false;
              }, 3000);
            });
        }
      };

      $scope.close = function (params) {
        if (params === undefined) {
          $modalInstance.close();
        } else {
          $modalInstance.close(params);
        }
      };

      $rootScope.$on('getUpdatedVariants', function () {
        $scope.close();
      });


      $scope.init();

    });

    angular.module('adidas.variants')
      .controller('EditVariantCtrl', function ($scope, VariantService, $window, $modalInstance, mainLoader, appName, params, userType, $modal, userid, editVariant, brand, $filter) {
        $scope.model = {
          name: angular.copy(editVariant.variantName),
          description: angular.copy(editVariant.variantDsc),
          isPublic: angular.copy(editVariant.isPublic),
          isDefault: angular.copy(editVariant.isDefault),
          userId: angular.copy(editVariant.shareUsers)
        };

        $scope.brand = brand;
        $scope.accountList = [];
        $scope.showProgress = false;
        $scope.userType = userType;
        $scope.preselectedUsers = '';

        $scope.hasError = false;

        $scope.init = function () {
          console.log('THIS IS THE VARIANT BEING EDITED: ', editVariant);
          $scope.preselectedUsers = angular.copy($scope.model.userId);
          VariantService.getAccountList(userid)
            .then(function success (response) {
              var filteredAccounts = [];
              var accounts = eval(response.data);
              // for (var i=0; i<res.length; i++) {
              //   if (res[i].brand === $scope.brand || res[i].brand === 'AR' && res[i].shipTo !== '') {
              //     accounts.push(res[i]);
              //   }
              // }

              // accounts.push(res);

              filteredAccounts = $filter('filter')(accounts, function (item) {
                if(item.shipTo === item.soldTo && item.name !== '-- select --'){
                  return true;
                } else {
                  return false;
                }
              });

              $scope.accountList = filteredAccounts;
              // $scope.accountList = accounts;
            }, function err (response) {
              console.log('Error while retrieving account list: ', response);
            });
        };

        $scope.saveVariant = function () {
          $scope.hasError = false;
          $scope.mainLoader = true;
          $scope.showProgress = true;
          var paramsCopy = params;
          if (appName === 'IA' && paramsCopy.startDate !== undefined) {
            delete paramsCopy.startDate;
          }

          paramsCopy.soldToList = '';
          if (userType === 'C') {
            $scope.isPublic = 'N';
            $scope.model.userId = '';
          }

          // VariantService.saveNewVariant(appName, $scope.model, paramsCopy)
          var sendVariant = angular.copy(editVariant);
          sendVariant.variantName = $scope.model.name;
          sendVariant.variantDsc = $scope.model.description;
          sendVariant.isDefault = $scope.model.isDefault;
          sendVariant.isPublic = $scope.model.isPublic;
          sendVariant.shareUsers = $scope.model.userId;
          // FINISH UPDATING THE VARIANT COPY
          VariantService.updateVariant(appName, editVariant.id, sendVariant, $scope.model.isDefault)
            .then(function success (response) {
              $scope.mainLoader = false;
              $scope.showProgress = false;
              $modalInstance.close(response);
            }, function err (response) {
              $scope.mainLoader = false;
              $scope.showProgress = false;
              $scope.hasError = true;
            });
        };

      $scope.openUserList = function(size) {
        var modalInstance = $modal.open({
            animation: true,
            template: '<div class="modal-header"> <div ng-click="cancel()" class="close">X</div><h3 class="modal-title">Share With Accounts</h3></div><div class="modal-body variant-container" stop-event="touchend"> <progress-bar ng-show="model.showProgress"></progress-bar> <div class="col-md-6 shiptocontainer desktop"> <form class="modal-form shiptoform"> <div> <label>Ship To #</label> <input maxlength="10" type="text" ng-model="model.shipToNum" ng-change="searchList()"> </div><div> <label>Sold To #</label> <input maxlength="10" type="text" ng-model="model.soldToNum" ng-change="searchList()"> </div></form> </div><div class="col-md-6 namecontainer desktop"> <form class="modal-form nameform"> <div> <label class="nameinput">Name</label> <input maxlength="50" type="text" ng-model="model.shiptoname" ng-change="searchList()"> </div><div> <label class="cityinput">City</label> <input maxlength="50" type="text" ng-model="model.city" ng-change="searchList()"> </div><div> <label class="zipinput">Zip Code</label> <input maxlength="50" type="text" ng-model="model.zip" ng-change="searchList()"> </div></form> <br></div></div><div class="modal-footer variant-container"> <div class="buttonwrapper"> </div><div style="margin-top:20px" class="desktop top-wrapper"> <pagination ng-change="shipPageChanged()" total-items="model.filteredList.length" ng-model="model.currentPage" items-per-page="model.pageSize" max-size="model.pagesToShow" boundary-links="true" class="pagination-group" ng-hide="model.filteredList.length<=0 || model.filteredList.length<=model.pageSize"></pagination> <div class="col-xs-12 action-button-container"> <button ng-click="cancel()" class="bottombuttons text-center done-button">Done</button> <div class="add-buttons"> <button ng-click="addAll()" class="bottombuttons text-right done-button">Add All</button> <button ng-click="removeAll()" ng-disabled="areNoneSelected()" ng-class="areNoneSelected() ? \'disabled-search\' : \'\'" class="bottombuttons text-right done-button">Remove All</button> </div></div></div><div class="mobile"> <pagination ng-change="shipPageChanged()" total-items="model.filteredList.length" ng-model="model.currentPage" items-per-page="model.pageSize" max-size="model.pagesToShow" boundary-links="false" class="pagination-group" ng-hide="model.filteredList.length<=0 || model.filteredList.length<=model.pageSize" previous-text="&lsaquo;" next-text="&rsaquo;"></pagination> </div><table border="1" ng-hide="model.shipToListParams.length===0" class="variant-lookup-table"> <thead> <tr> <th>Sold-To #</th> <th>Name / City</th> <th>Add / Remove</th> </tr></thead> <tbody> <tr ng-repeat="lineCust in model.filteredList | limitTo:model.pageSize:model.beginFrom"> <td>{{lineCust.shipTo}}</td><td>{{lineCust.name}}<br>{{lineCust.city}}</td><td> <button ng-click="addShipTo(lineCust.shipTo)" class="bottombuttons" ng-show="!checkAccountDoesNotExist(lineCust.shipTo)">Add</button> <button ng-click="removeShipTo(lineCust.shipTo)" class="bottombuttons" ng-show="checkAccountDoesNotExist(lineCust.shipTo)">Remove</button> </td></tr></tbody> </table> <div class="col-xs-12 text-center" style="margin-bottom: 10px"> <button ng-click="cancel()" class="bottombuttons text-center">Done</button> </div><div style="padding-top:15px" class="desktop"> <pagination ng-change="shipPageChanged()" total-items="model.filteredList.length" ng-model="model.currentPage" items-per-page="model.pageSize" max-size="model.pagesToShow" boundary-links="true" class="pagination-group" ng-hide="model.filteredList.length<=0 || model.filteredList.length<=model.pageSize"></pagination> </div><div class="mobile"> <pagination ng-change="shipPageChanged()" total-items="model.filteredList.length" ng-model="model.currentPage" items-per-page="model.pageSize" max-size="model.pagesToShow" boundary-links="false" class="pagination-group" ng-hide="model.filteredList.length<=0 || model.filteredList.length<=model.pageSize" previous-text="&lsaquo;" next-text="&rsaquo;"></pagination> </div></div>',
            controller: 'AccountLookupCtrl',
            size: 'lg',
            resolve: {
                items: function() {
                    return $scope.accountList;
                },
                usertype: function () {
                  return $scope.userType;
                },
                chosenItems: function () {
                  return $scope.model.userId;
                }
            }
        });

        modalInstance.result.then(function(selectedAccounts) {
          if (selectedAccounts !== 'backdrop click') {
            $scope.selected = selectedItem;
          }
        }, function(selectedAccounts) {
          if (selectedAccounts !== undefined && selectedAccounts !== 'backdrop click' && selectedAccounts.length > 0) {
            var string = '';
            for (var i=0; i<selectedAccounts.length; i++) {
              if (i === 0) {
                string = selectedAccounts[i];
              } else {
                string = string + ',' + selectedAccounts[i];
              }
            }
            $scope.model.userId = string;
          } else {
            $scope.model.userId = '';
          }
        });
      };

      $scope.formatAccounts = function () {
        $scope.model.userId = $scope.model.userId.replace(/[ ,]+/g, ",");
        $scope.model.userId = $scope.model.userId.toUpperCase();
        var accounts = angular.copy($scope.model.userId.split(','));
        var string = '';
        if (accounts.length > 100) {
          alert('The maximum number of accounts you can share with is 100. If you would like to share with all of your accounts, please leave the Share With Accounts field blank.');
          for (var i=0; i<accounts.length; i++) {
            if (i <= 99) {
              if (i === 0) {
                string = string + accounts[i];
              } else {
                string = string + ',' + accounts[i];
              }
            }
          }
          string = string.toUpperCase();
          $scope.model.userId = string;
          return;
        }
      };

      $scope.close = function () {
        $modalInstance.close();
      };

      $scope.init();
    });

    angular.module('adidas.variants')
      .directive('adiProgressBar', function (appVer) {
        return {
          template: '<div class=loading><img src=images/loading.gif></div>'
          // restrict: 'E'
        };
    });

    angular.module('adidas.variants')
      .controller('VariantConfigCtrl', function ($scope, VariantService, $window, $modalInstance, mainLoader, appName, params, userType, $modal, userid, brand, $filter) {
        $scope.model = {
          name: '',
          description: '',
          isPublic: 'N',
          isDefault: 'N',
          userId: ''
        };
        $scope.brand = brand;
        $scope.accountList = [];
        $scope.showProgress = false;
        $scope.userType = userType;

        $scope.hasError = false;

        $scope.init = function () {
          VariantService.getAccountList(userid)
            .then(function success (response) {
              var filteredAccounts = [];
              var accounts = eval(response.data);
              // for (var i=0; i<res.length; i++) {
              //   if (res[i].brand === $scope.brand || res[i].brand === 'AR' && res[i].shipTo !== '') {
              //     accounts.push(res[i]);
              //   }
              // }

              // accounts.push(res);

              filteredAccounts = $filter('filter')(accounts, function (item) {
                if(item.shipTo === item.soldTo && item.name !== '-- select --'){
                  return true;
                } else {
                  return false;
                }
              });

              $scope.accountList = filteredAccounts;
            }, function err (response) {
              console.log('Error while retrieving account list: ', response);
            });
        };

        $scope.saveVariant = function () {
          $scope.hasError = false;
          $scope.mainLoader = true;
          $scope.showProgress = true;
          var paramsCopy = params;
          if (appName === 'IA' && paramsCopy.startDate !== undefined) {
            delete paramsCopy.startDate;
          }

          paramsCopy.soldToList = '';
          if (userType === 'C') {
            $scope.isPublic = 'N';
            $scope.model.userId = '';
          }

          VariantService.saveNewVariant(appName, $scope.model, paramsCopy)
            .then(function success (response) {
              $scope.mainLoader = false;
              $scope.showProgress = false;
              $modalInstance.close(response);
            }, function err (response) {
              $scope.mainLoader = false;
              $scope.showProgress = false;
              $scope.hasError = true;
            });
        };

      $scope.openUserList = function(size) {

        var modalInstance = $modal.open({
            animation: true,
            template: '<div class="modal-header"> <div ng-click="cancel()" class="close">X</div><h3 class="modal-title">Share With Accounts</h3></div><div class="modal-body variant-container" stop-event="touchend"> <progress-bar ng-show="model.showProgress"></progress-bar> <div class="col-md-6 shiptocontainer desktop"> <form class="modal-form shiptoform"> <div> <label>Ship To #</label> <input maxlength="10" type="text" ng-model="model.shipToNum" ng-change="searchList()"> </div><div> <label>Sold To #</label> <input maxlength="10" type="text" ng-model="model.soldToNum" ng-change="searchList()"> </div></form> </div><div class="col-md-6 namecontainer desktop"> <form class="modal-form nameform"> <div> <label class="nameinput">Name</label> <input maxlength="50" type="text" ng-model="model.shiptoname" ng-change="searchList()"> </div><div> <label class="cityinput">City</label> <input maxlength="50" type="text" ng-model="model.city" ng-change="searchList()"> </div><div> <label class="zipinput">Zip Code</label> <input maxlength="50" type="text" ng-model="model.zip" ng-change="searchList()"> </div></form> <br></div></div><div class="modal-footer"> <div class="buttonwrapper"> </div><div style="margin-top:20px" class="desktop top-wrapper"> <pagination ng-change="shipPageChanged()" total-items="model.filteredList.length" ng-model="model.currentPage" items-per-page="model.pageSize" max-size="model.pagesToShow" boundary-links="true" class="pagination-group" ng-hide="model.filteredList.length<=0 || model.filteredList.length<=model.pageSize"></pagination> <div class="col-xs-12 action-button-container"> <button ng-click="cancel()" class="bottombuttons text-center done-button">Done</button> <div class="add-buttons"> <button ng-click="addAll()" class="bottombuttons text-right done-button">Add All</button> <button ng-click="removeAll()" ng-disabled="areNoneSelected()" ng-class="areNoneSelected() ? \'disabled-search\' : \'\'" class="bottombuttons text-right done-button">Remove All</button> </div></div></div><div class="mobile"> <pagination ng-change="shipPageChanged()" total-items="model.filteredList.length" ng-model="model.currentPage" items-per-page="model.pageSize" max-size="model.pagesToShow" boundary-links="false" class="pagination-group" ng-hide="model.filteredList.length<=0 || model.filteredList.length<=model.pageSize" previous-text="&lsaquo;" next-text="&rsaquo;"></pagination> </div><table border="1" ng-hide="model.shipToListParams.length===0" class="variant-lookup-table"> <thead> <tr> <th>Sold-To #</th> <th>Name / City</th> <th>Add / Remove</th> </tr></thead> <tbody> <tr ng-repeat="lineCust in model.filteredList | limitTo:model.pageSize:model.beginFrom"> <td>{{lineCust.shipTo}}</td><td>{{lineCust.name}}<br>{{lineCust.city}}</td><td> <button ng-click="addShipTo(lineCust.shipTo)" class="bottombuttons" ng-show="!checkAccountDoesNotExist(lineCust.shipTo)">Add</button> <button ng-click="removeShipTo(lineCust.shipTo)" class="bottombuttons" ng-show="checkAccountDoesNotExist(lineCust.shipTo)">Remove</button> </td></tr></tbody> </table> <div class="col-xs-12 text-center" style="margin-bottom: 10px"> <button ng-click="cancel()" class="bottombuttons text-center">Done</button> </div><div style="padding-top:15px" class="desktop"> <pagination ng-change="shipPageChanged()" total-items="model.filteredList.length" ng-model="model.currentPage" items-per-page="model.pageSize" max-size="model.pagesToShow" boundary-links="true" class="pagination-group" ng-hide="model.filteredList.length<=0 || model.filteredList.length<=model.pageSize"></pagination> </div><div class="mobile"> <pagination ng-change="shipPageChanged()" total-items="model.filteredList.length" ng-model="model.currentPage" items-per-page="model.pageSize" max-size="model.pagesToShow" boundary-links="false" class="pagination-group" ng-hide="model.filteredList.length<=0 || model.filteredList.length<=model.pageSize" previous-text="&lsaquo;" next-text="&rsaquo;"></pagination> </div></div>',
            controller: 'AccountLookupCtrl',
            size: 'lg',
            resolve: {
                items: function() {
                    return $scope.accountList;
                },
                usertype: function () {
                  return $scope.userType;
                },
                chosenItems: function () {
                  return $scope.model.userId;
                }
            }
        });

        modalInstance.result.then(function(selectedAccounts) {
            $scope.selected = selectedItem;
        }, function(selectedAccounts) {
          if (selectedAccounts !== undefined && selectedAccounts !== 'backdrop click' &&  selectedAccounts !== undefined &&selectedAccounts.length > 0) {
            var string = '';
            for (var i=0; i<selectedAccounts.length; i++) {
              if (i === 0) {
                string = selectedAccounts[i];
              } else {
                string = string + ',' + selectedAccounts[i];
              }
            }
            $scope.model.userId = string;
          } else {
            $scope.model.userId = '';
          }
        });
      };

      $scope.formatAccounts = function () {
        $scope.model.userId = $scope.model.userId.replace(/[ ,]+/g, ",");
        $scope.model.userId = $scope.model.userId.toUpperCase();
        var accounts = angular.copy($scope.model.userId.split(','));
        var string = '';
        if (accounts.length > 100) {
          alert('The maximum number of accounts you can share with is 100. If you would like to share with all of your accounts, please leave the Share With Accounts field blank.');
          for (var i=0; i<accounts.length; i++) {
            if (i <= 99) {
              if (i === 0) {
                string = string + accounts[i];
              } else {
                string = string + ',' + accounts[i];
              }
            }
          }
          string = string.toUpperCase();
          $scope.model.userId = string;
          return;
        }
      };

      $scope.close = function () {
        $modalInstance.close();
      };

      $scope.init();
    });

    angular.module('adidas.variants')
    .controller('AccountLookupCtrl', function($scope, $window, $log, $modalInstance, $filter, items, usertype, chosenItems) {
        $scope.brand = 'A';
        $scope.model = {
            searchParams: '',
            shipToListParams: '',
            showProgress: false,
            shiptoname: '',
            city: '',
            shipToNum: '',
            pzcode: '',
            currentPage: 1,
            pageSize: 50,
            pagesToShow: 5,
            beginFrom: 0,
            filteredList: '',
            soldToNum: '',
            zip: ''
        };
        $scope.itemSelect = '';
        $scope.selectedAccounts = [];
        $scope.chosenItems = '';
        $scope.originalSelectionLength = '';

        $scope.init = function() {
            var predefinedShiptos = [];
            console.log('CHOSEN ITEMS: ', chosenItems);
            if (chosenItems !== undefined && chosenItems !== '') {
              predefinedShiptos = angular.copy(chosenItems).split(',');
            }
            $scope.itemBrandList = ''; //set selected brand on initial load
            for (var i=0; i<predefinedShiptos.length; i++) {
              $scope.selectedAccounts.push(predefinedShiptos[i]);
            }
            $scope.model.currentPage = 1;
            $scope.model.shipToListParams = items;
            $scope.model.filteredList = '';
            $scope.originalSelectionLength = angular.copy($scope.selectedAccounts.length);
            $scope.searchList();
        };

        $scope.searchList = function () {
            var nameUpper = $scope.model.shiptoname.toUpperCase();
            var cityUpper = $scope.model.city.toUpperCase();
            var shipToUpper = $scope.model.shipToNum.toUpperCase();
            var soldToUpper = $scope.model.soldToNum.toUpperCase();
            var zipUpper = $scope.model.zip.toUpperCase();
            var soldToParams = '';

            // if ($scope.model.searchParams.soldToNbr.length>=10) {
            //     if ($scope.model.searchParams.soldToNbr.search(',')!==-1) {
            //         soldToParams = $scope.model.searchParams.soldToNbr.split(',');
            //     } else {
            //         soldToParams = [];
            //         soldToParams.push($scope.model.searchParams.soldToNbr);
            //     }
            // }

            $scope.model.filteredList = $filter('filter')($scope.model.shipToListParams, function (item) {
                if(item.postal.toUpperCase().indexOf(zipUpper) !== -1 && item.name.toUpperCase().indexOf(nameUpper)!==-1 && item.city.toUpperCase().indexOf(cityUpper)!==-1 && item.shipTo.toUpperCase().indexOf(shipToUpper)!==-1 && item.soldTo.toUpperCase().indexOf(soldToUpper)!==-1){
                    if (usertype !== 'C' && (soldToParams.length>0 || soldToParams!=='')) {
                        var match = false;
                        for (var i=0; i<soldToParams.length;i++) {
                            if (item.soldTo === soldToParams[i]) {
                                match = true;
                            }
                        }
                        return match;
                    } else {
                        return true;
                    }
                } else {
                    return false;
                }
            });
        };

        $scope.checkAccountDoesNotExist = function (shipto) {
          var match = false;
          for (var i=0; i<$scope.selectedAccounts.length; i++) {
            if ($scope.selectedAccounts[i] === shipto) {
              match = true;
            }
          }
          return match;
        };

        $scope.addShipTo = function (shipTo) {

          if ($scope.selectedAccounts.length === 0) {
            $scope.selectedAccounts.push(shipTo);
            return;
          }
          if ($scope.selectedAccounts.length >= 100) {
            alert('The maximum number of accounts you can share with is 100. If you would like to share with all of your accounts, please leave the Share With Accounts field blank.');
            return;
          }
          var match = false;
          for (var i=0; i<$scope.selectedAccounts.length; i++) {
            if ($scope.selectedAccounts[i] === shipTo) {
              match = true;
              $scope.selectedAccounts = $scope.selectedAccounts.splice(i, 0);
              return;
            }
          }
          if (!match) {
            $scope.selectedAccounts.push(shipTo);
          }
        };

        $scope.removeShipTo = function (shipTo) {
          for (var i=0; i<$scope.selectedAccounts.length; i++) {
            if ($scope.selectedAccounts[i] === shipTo) {
              $scope.selectedAccounts.splice(i, 1);
              return;
            }
          }
        };

        $scope.addAll = function () {
          var totalItems = angular.copy($scope.selectedAccounts.length);

          for (var i=0; i<$scope.model.filteredList.length; i++) {
            var match = false;
            if (totalItems >= 100) {
              alert('You have reached the maximum number of accounts. The first ' + (100-$scope.originalSelectionLength)  + ' account(s) have been selected.');
              return;
            }
            for (var k=0; k<$scope.selectedAccounts.length; k++) {
              if ($scope.model.filteredList[i].shipTo === $scope.selectedAccounts[k]) {
                match = true;
              }
            }
            if (!match) {
              $scope.selectedAccounts.push($scope.model.filteredList[i].shipTo);
              totalItems = totalItems + 1;
            }
          } 
        };

        $scope.removeAll = function () {
          var confirmRemove = (confirm('Would you like to remove all selected accounts?'));
          if (confirmRemove) {
            $scope.selectedAccounts = [];
          }
        };

        $scope.areNoneSelected = function () {
          if ($scope.selectedAccounts.length === 0) {
            return true;
          } else {
            return false;
          }
        };

        $scope.cancel = function() {
            // MagicAPI.cancelRequest();
            $modalInstance.dismiss($scope.selectedAccounts);
        };

        $scope.selectedShipTo = function(selected) {
            // alert(selected.lineCust.ds);
            // globalParams.setShipTo(selected.lineCust.shipTo);
            $scope.cancel();
        };

        $scope.shipPageChanged = function() {
            $window.scrollTo(0, 0);
            $log.log('Page changed to: ' + $scope.model.currentPage);
            var changePage = ($scope.model.currentPage * $scope.model.pageSize) - $scope.model.pageSize;
            $scope.model.beginFrom = changePage;
        };

        $scope.init();
    });

  angular.module('adidas.variants')
    .factory('VariantService', function ($q, $http, $location, $window) {
      var localData = 'bower_components/adidas.variants/variants.txt';
      var localAccounts = 'bower_components/adidas.variants/accountlist.txt';
      var MAGIC_URL = '/Magic94scripts/mgrqispi94.dll';
      var serviceUrl = 'appname=Portal_SAP&prgname=NG_VARIANT_SERVICE';
      var absURL = $location.absUrl();
      var localSaveSuccess = 'bower_components/adidas.variants/save_variant.txt';

      return {
        getVariantList: function (appName) {
          var deferred = $q.defer();
          var url = localData;
          var params = '&SESIONID='+($window.opener?($window.opener.top.GLBSID||top.GLBSID):'')+'&MODE=R&APPNAME='+appName;
          if (absURL.indexOf(':9000') === -1) {
            url = serviceUrl+params;
            $http.post(MAGIC_URL, url)
              .then(function success (response) {
                deferred.resolve(response);
              }, function err (response) {
                var res = eval(response.data);
                deferred.reject(res[0]);
              });
            return deferred.promise;
          } else {
            $http.get(localData)
              .then(function success (response) {
                deferred.resolve(response);
              });
              return deferred.promise;
          }
        },
        getDefaultVariant: function (appName) {
          var deferred = $q.defer();
          var url = localData;
          var params = '&SESIONID='+($window.opener?($window.opener.top.GLBSID||top.GLBSID):'')+'&MODE=F&APPNAME='+appName;
          if (absURL.indexOf(':9000') === -1) {
            url = serviceUrl+params;
            $http.post(MAGIC_URL, url)
              .then(function success (response) {
                deferred.resolve(response);
              }, function err (response) {
                var res = eval(response.data);
                deferred.reject(res[0]);
              });
            return deferred.promise;
          } else {
            $http.get(localData)
              .then(function success (response) {
                deferred.resolve(response);
              });
              return deferred.promise;
          }
        },
        updateVariant: function (appName, variantID, variant, def) {
          var deferred = $q.defer();
          var variantParams = '';
          var isDefault = def;
          if (def === '') {
            isDefault = variant.isDefault;
          }
          if (variant.shareUsers !== undefined) {
            variant.shareUsere = variant.shareUsers;
          }
          var params = '&SESIONID='+ ($window.opener?($window.opener.top.GLBSID||top.GLBSID):'') + '&MODE=U&APPNAME=' + appName + '&VARIANTID=' + variantID + '&VARIANTNAME=' + variant.variantName + '&VARIANTDESC=' + variant.variantDsc + '&ISDEFAULT=' + isDefault + '&ISPUBLIC=' + variant.isPublic + '&SHAREUSERID=' + variant.shareUsere + '&VARIANTPARAMS=' + JSON.stringify(variant.params);
          console.log('PARAMS BEING SENT ON UPDATE: ', params);
          if (absURL.indexOf(':9000') === -1) {
            $http.post(MAGIC_URL, serviceUrl+params.toString())
              .then(function success (response) {
                console.log('UPDATE RESPONSE: ', response);
                deferred.resolve(response);
              }, function err (response) {
                var res = eval(response.data);
                deferred.reject(res[0]);
              });
          } else {
            $http.get(localData)
              .then(function (response) {
                deferred.resolve(response);
              });
          }
          return deferred.promise;
        },
        saveNewVariant: function (appName, variant, params) {
          var deferred = $q.defer();
          var params = '&SESIONID='+ ($window.opener?($window.opener.top.GLBSID||top.GLBSID):'') + '&MODE=N&APPNAME=' + appName + '&VARIANTNAME=' + variant.name + '&VARIANTDESC=' + variant.description + '&ISPUBLIC=' + variant.isPublic + '&ISDEFAULT=' + variant.isDefault + '&SHAREUSERID=' + variant.userId + '&VARIANTPARAMS=' + JSON.stringify(params);
          console.log('PARAMS FOR SAVING: ', params);
          if (absURL.indexOf(':9000') === -1) {
            $http.post(MAGIC_URL, serviceUrl+params.toString())
              .then(function success (response) {
                var res = eval(response.data);
                if (res[0].success === 'Y') {
                  deferred.resolve(response);
                } else {
                  deferred.reject(response);
                }
              }, function err (response) {
                console.log('Error while saving variant: ', response);
                var res = eval(response.data);
                deferred.reject(res[0]);
              });
          } else {
            console.log('Local variant save');
            $http.get(localData)
              .then(function (response) {
                deferred.resolve(response);
              });
          }
          return deferred.promise;
        },
        deleteVariant: function (appName, variant) {
          var deferred = $q.defer();
          var params = '&SESIONID='+ ($window.opener?($window.opener.top.GLBSID||top.GLBSID):'') + '&MODE=D&APPNAME=' + appName + '&VARIANTID=' + variant.id;

          if (absURL.indexOf(':9000') === -1) {
            $http.post(MAGIC_URL, serviceUrl+params.toString())
              .then(function success (response) {
                var res = eval(response.data);
                if (res[0].success === 'Y') {
                  deferred.resolve(response);
                } else {
                  deferred.reject(res[0]);
                }
              }, function err (response) {
                var res = eval(response.data);
                deferred.reject(res[0]);
              });
          } else {
            $http.get(localData)
              .then(function (response) {
                deferred.resolve(response);
              });
          }
          return deferred.promise;
        },
        getAccountList: function (userId) {
          var deferred = $q.defer();
          var params = 'appname=Portal_SAP&prgname=' + 'NG_OP_PARAM'+'&PROCESS_TYPE=A' + '&SAVEFILE=N&ACCOUNT=' + userId;
          console.log('userid in account list: ', userId);
          if (absURL.indexOf(':9000') === -1) {
            $http.post(MAGIC_URL, params)
              .then(function (response) {
                deferred.resolve(response);
              }, function err (response) {
                deferred.reject(response);
              });
          } else {
            // local
            $http.get(localAccounts)
              .then(function (response) {
                deferred.resolve(response);
              });
          }
          return deferred.promise;

        }
      };
    });