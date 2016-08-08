'use strict';
angular.module('adidas.variants', []);

angular.module('adidas.variants')
  .directive('variants', function () {
    return {
      template: '<div class=variant-wrapper><a><span class="glyphicon variant-icon glyphicon-floppy-disk"ng-click=save() ng-class="{\'variant-icon-disabled\':isSaveDisabled()}"ng-disabled=isSaveDisabled()></span></a> <a><span class="glyphicon variant-icon glyphicon-search"ng-click=loadVariants()></span></a></div>',
      restrict: 'E',
      scope: {
        params: '=',
        userid: '=',
        appName: '=',
        mainLoader: '=',
        usertype: '='
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
            VariantService.getDefaultVariant($scope.appName)
              .then(function success (response) {
                var res = eval(response.data);
                if (res !== []) {
                  _.each(res, function (value, key) {
                      _.each(value.params, function (resVal, resKey) {
                        $scope.params[resKey] = resVal;
                      });
                  });
                  $scope.defaultVariant = res[0].id;
                }
              }, function err () {
                console.log('The system is busy and could not retrieve the default search. Please try again later.');
              });
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
            template: '<div class=modal-header><div class=close ng-click=close()>X</div><div class=modal-title><h3 class=modal-title>Save Search to Favorites</h3></div></div><div class=modal-body><adi-progress-bar ng-show=showProgress></adi-progress-bar><div class="alert alert-danger"align=center ng-show=hasError role=alert>Unable to save search at this time.</div><ul><li><label for="">Search Name</label><input ng-model=model.name class="search-field-modal match-input-width"maxlength=30 name=VARIANT size=30><li><label for="">Description</label><input ng-model=model.description class="search-field-modal match-input-width"maxlength=100 name=DESCRIPTION size=30><li class=variant-make-public ng-if="userType !== \'C\'"><label for="">Make Public</label><label for=PUBLIC_Y><input ng-model=model.isPublic id=PUBLIC_Y ng-value="\'Y\'"type=radio>Yes</label><label for=PUBLIC_N><input ng-model=model.isPublic id=PUBLIC_N ng-value="\'N\'"type=radio ng-click="model.userid = \'\'">No</label><label for=""class=userid-field ng-show="model.isPublic === \'Y\'">User ID (Optional)</label><input ng-model=model.userid class="search-field-modal userid-input"maxlength=10 name=USERID size=30 ng-show="model.isPublic === \'Y\'"><li class=variant-make-public><label for="">Set as Default</label><label for=DEFAULT_Y><input ng-model=model.isDefault id=DEFAULT_Y ng-value="\'Y\'"type=radio>Yes</label><label for=DEFAULT_N><input ng-model=model.isDefault id=DEFAULT_N ng-value="\'N\'"type=radio>No</label></ul></div><div class=modal-footer><div style=padding-top:15px><button class=bottombuttons ng-click=saveVariant() ng-class="{\'disabled-save\': (model.name === \'\' || model.description === \'\')}"ng-disabled="model.name === \' || model.description === \'">Save</button> <button class=bottombuttons ng-click=close()>Close</button></div></div>',
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
                $scope.mainLoader = false;
                var loadInstance = $modal.open({
                  template: '<div class=modal-header><div class=close ng-click=close()>X</div><div class=modal-title><h3 class=modal-title>Favorite Search Lookup</h3></div></div><div class=modal-body><div class="alert alert-danger"align=center ng-show=hasError role=alert>{{errorMsg}}</div><div class="alert alert-success"align=center ng-show=hasSuccess role=alert>{{successMsg}}</div><div class="desktop col-md-6 shiptocontainer"><form class="modal-form leftvariantform shiptoform"><div><label for="">Search Name</label><input ng-model=model.name ng-change=searchList() maxlength=100 name=VARIANT size=30></div><div><label for="">Description</label><input ng-model=model.description ng-change=searchList() maxlength=100 name=DESCRIPTION size=30></div></form></div><div class="desktop col-md-6 namecontainer"><form class="modal-form nameform rightvariantform"><div class=onlyMySearches><label for=""class=breakLine>Only My Searches</label><label for=PUBLIC_Y class=push-right><input ng-model=onlyMine ng-change=searchList() id=PUBLIC_Y ng-value=true type=radio>Yes</label><label for=PUBLIC_N><input ng-model=onlyMine ng-change=searchList() id=PUBLIC_N ng-value=false type=radio>No</label></div><div ng-if=!onlyMine><label for="">Created By</label><input ng-model=model.userID ng-change=searchList() id=onlyMineUser maxlength=50 name=USER size=30></div></form></div></div><div class=modal-footer><div class=desktop style=padding-top:15px><pagination boundary-links=true class=pagination-group items-per-page=model.pageSize max-size=model.pagesToShow ng-change=pageChange() ng-hide="model.filteredList.length<=0 || model.filteredList.length<=model.pageSize"ng-model=model.currentPage total-items=model.filteredList.length></pagination></div><div class=mobile><pagination boundary-links=false class=pagination-group items-per-page=model.pageSize max-size=model.pagesToShow ng-change=pageChange() ng-hide="model.filteredList.length<=0 || model.filteredList.length<=model.pageSize"ng-model=model.currentPage total-items=model.filteredList.length next-text=› previous-text=‹></pagination></div><table border=1 class=variantResultList ng-hide="model.filteredList.length===0"><thead><tr><th><a class=sort-link href=""ng-click="order(\'variantName\')">Search Name</a> <span class=sortorder ng-class={reverse:reverse} ng-show="predicate === \'variantName\'"></span><th><a class=sort-link href=""ng-click="order(\'variantDsc\')">Description</a> <span class=sortorder ng-class={reverse:reverse} ng-show="predicate === \'variantDsc\'"></span><th><a class=sort-link href=""ng-click="order(\'createdBy\')">Created By</a> <span class=sortorder ng-class={reverse:reverse} ng-show="predicate === \'createdBy\'"></span><th><a class=sort-link href=""ng-click="order(\'lastModified\')">Last Modified</a> <span class=sortorder ng-class={reverse:reverse} ng-show="predicate === \'lastModified\'"></span><th>Default<th>Select<th>Remove<tbody><tr ng-repeat="variant in model.filteredList | orderBy:[predicate, \'variantName\']:reverse | limitTo:model.pageSize:model.beginFrom"><td>{{variant.variantName}}<td>{{variant.variantDsc}}<td>{{variant.createdBy}}<td>{{variant.lastModified}}<td><input ng-model=isDefault id={{variant.id}}Default type=radio class=isDefaultRadio name={{variant.id}}Default ng-checked=checkIsDefault(variant.id) ng-click=makeDefault(variant)><label for={{variant.id}}Default>Set default</label><td><button class=bottombuttons ng-click=selectVariant(variant)>Select</button><td><i class="deleteVariantButton glyphicon glyphicon-remove"ng-click=deleteVariant(variant) ng-if="variant.createdBy === userid"></i></table><div class=desktop><pagination boundary-links=true class=pagination-group items-per-page=model.pageSize max-size=model.pagesToShow ng-change=pageChange() ng-hide="model.filteredList.length<=0 || model.filteredList.length<=model.pageSize"ng-model=model.currentPage total-items=model.filteredList.length></pagination></div><div class=mobile><pagination boundary-links=false class=pagination-group items-per-page=model.pageSize max-size=model.pagesToShow ng-change=pageChange() ng-hide="model.filteredList.length<=0 || model.filteredList.length<=model.pageSize"ng-model=model.currentPage total-items=model.filteredList.length next-text=› previous-text=‹></pagination></div></div>',
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
                    }
                  }
                });

                loadInstance.result.then(function (variant) {
                  if (variant !== undefined) {
                    $scope.params = variant.params;
                    $scope.variant = variant;
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

        $timeout(function () {
          $scope.$watch(function () {return $scope.params}, function (newV, oldV) {
            if (newV !== oldV) {
              $scope.saveDisabled = false;
            }
          }, true);
        });

        $scope.init();
      }
    };
  });

  angular.module('adidas.variants')
    .controller('VariantCtrl', function ($scope, params, defaultParams, userid, appName, variants, defaultVariant, VariantService, $window, $filter, $modalInstance, $timeout) {
      $scope.params = params;
      $scope.userid = userid;
      $scope.appName = appName;
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
      $scope.reverse = false;
      $scope.resultsCopy = '';

      $scope.init = function () {
        $scope.showProgress = true;
        $scope.results = variants;
        $scope.isDefault = defaultVariant;
        $scope.searchList();
      };

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

      $scope.date2String = function (date) {
        if(date===undefined || date==='' || date === '0'){
          return '';
        }
        return date.slice(6,8) + '/' + date.slice(4,6) + '/' + date.slice(0,4);
      };

      $scope.close = function (params) {
        if (params === undefined) {
          $modalInstance.close();
        } else {
          $modalInstance.close(params);
        }
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
      .controller('VariantConfigCtrl', function ($scope, VariantService, $window, $modalInstance, mainLoader, appName, params, userType) {
        $scope.model = {
          name: '',
          description: '',
          isPublic: 'N',
          isDefault: 'N',
          userId: ''
        };
        $scope.showProgress = false;
        $scope.userType = userType;

        $scope.hasError = false;

        $scope.saveVariant = function () {
          $scope.hasError = false;
          $scope.showProgress = true;
          var paramsCopy = params;

          paramsCopy.soldToList = '';
          if (userType === 'C') {
            $scope.isPublic = 'N';
            $scope.model.userId = '';
          }

          VariantService.saveNewVariant(appName, $scope.model, paramsCopy)
            .then(function success (response) {
              $scope.showProgress = false;
              $modalInstance.close(response);
            }, function err (response) {
              $scope.showProgress = false;
              $scope.hasError = true;
            });
        };

        $scope.close = function () {
          $modalInstance.close();
        };
      });

  angular.module('adidas.variants')
    .factory('VariantService', function ($q, $http, $location, $window) {
      var localData = 'bower_components/adidas.variants/variants.txt';
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
          var params = '&SESIONID='+ ($window.opener?($window.opener.top.GLBSID||top.GLBSID):'') + '&MODE=U&APPNAME=' + appName + '&VARIANTID=' + variantID + '&VARIANTNAME=' + variant.variantName + '&VARIANTDESC=' + variant.variantDsc + '&ISDEFAULT=' + isDefault + '&ISPUBLIC=' + variant.isPublic + '&SHAREUSERID=' + variant.shareUsere + '&VARIANTPARAMS=' + JSON.stringify(variant.params);
          if (absURL.indexOf(':9000') === -1) {
            $http.post(MAGIC_URL, serviceUrl+params.toString())
              .then(function success (response) {
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
          var params = '&SESIONID='+ ($window.opener?($window.opener.top.GLBSID||top.GLBSID):'') + '&MODE=N&APPNAME=' + appName + '&VARIANTNAME=' + variant.name + '&VARIANTDESC=' + variant.description + '&ISPUBLIC=' + variant.isPublic + '&ISDEFAULT=' + variant.isDefault + '&SHAREUSERID=' + variant.userid + '&VARIANTPARAMS=' + JSON.stringify(params);
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
        }
      };
    });