'use strict';
angular.module('adidas.variants', []);

angular.module('adidas.variants')
  .directive('variants', function () {
    return {
      templateUrl: '/bower_components/adidas.variants/variants.html',
      restrict: 'E',
      scope: {
        params: '=',
        userid: '=',
        appName: '=',
        mainLoader: '='
      },
      controller: function ($scope, $modal, $timeout, VariantService, $rootScope) {
        $scope.saveDisabled = true;
        $scope.variant = [];
        $scope.showProgress = false;

        $scope.init = function () {

          VariantService.getVariantList($scope.appName)
          .then(function success (response) {
            var res = eval(response.data);
            for (var i=0; i<res.length;i++) {
              if (res[i].isDefault === 'Y') {
                $scope.variant = res[i];
                $scope.params = res[i].params;
                $timeout(function () {
                  $scope.$apply();
                });
              }
            }
          }, function err () {
            console.log('The system is busy and could not retrieve the list of searches. Please try again later.');
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
              VariantService.updateVariant($scope.appName, $scope.variant.id, $scope.variant)
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
            templateUrl: '/bower_components/adidas.variants/variant-config.html',
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
          var loadInstance = $modal.open({
            templateUrl: '/bower_components/adidas.variants/variant-search.html',
            controller: 'VariantCtrl',
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
              }
            }
          });

          loadInstance.result.then(function (variant) {
            $scope.params = variant.params;
            $scope.variant = variant;
          }, function err () {
            // Modal closed via backdrop click
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
    .controller('VariantCtrl', function ($scope, params, userid, appName, VariantService, $window, $filter, $modalInstance) {
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

      $scope.init = function () {
        $scope.showProgress = true;

        VariantService.getVariantList(appName)
          .then(function success (response) {
            $scope.results = eval(response.data);
            $scope.searchList();
          }, function err () {
            $scope.hasError = true;
            $scope.errorMsg = 'The system is busy and could not retrieve the list of searches. Please try again later.';
          });
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
            if(item.variantName.toUpperCase().indexOf(nameUpper) !== -1 && item.shortDescription.toUpperCase().indexOf(descriptionUpper) !==-1 && item.createdBy.toUpperCase().indexOf(userIdUpper) !== -1){
                return true;
            } else {
                return false;
            }
        });
      };

      $scope.selectVariant = function (variant) {
        $scope.close(variant);
      };

      $scope.deleteVariant = function (variant) {
        $scope.showProgress = true;
        var confirmation = confirm('Are you sure you want to delete this search?');
        if (confirmation) {
          VariantService.deleteVariant(appName, variant)
            .then(function success (response) {
              $scope.results = response;
              $scope.hasSuccess = true;
              $scope.successMsg = 'Search has been successfully deleted.';
              $scope.showProgress = false;
            }, function err (response) {
              $scope.hasError = true;
              $scope.errorMsg = 'The system is busy and could not delete your search. Please try again later.';
              $scope.showProgress = false;
            });
        }
      };

      $scope.close = function (params) {
        if (params === undefined) {
          $modalInstance.close($scope.params);
        } else {
          $modalInstance.close(params);
        }
      };

      $scope.init();

    });

    angular.module('adidas.variants')
      .directive('adiProgressBar', function (appVer) {
        return {
          templateUrl: '/bower_components/adidas.variants/variant-progress-bar.html'
          // restrict: 'E'
        };
    });

    angular.module('adidas.variants')
      .controller('VariantConfigCtrl', function ($scope, VariantService, $window, $modalInstance, mainLoader, appName) {
        $scope.model = {
          name: '',
          description: '',
          isPublic: 'N',
          isDefault: 'N'
        };
        $scope.showProgress = false;

        $scope.hasError = false;

        $scope.saveVariant = function () {
          $scope.hasError = false;
          $scope.showProgress = true;
          VariantService.saveNewVariant(appName, $scope.model)
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
      var serviceUrl = '/appname=Portal_SAP&prgname=NG_VARIANT_SERVICE';
      var absURL = $location.absUrl();
      var localSaveSuccess = 'bower_components/adidas.variants/save_variant.txt';

      return {
        getVariantList: function (appName) {
          var deferred = $q.defer();
          // var country = ($window.opener?$window.opener.top.GLBCOUNTRY:'CA');
          var url = localData;
          var params = '&SESIONID='+($window.opener?($window.opener.top.GLBSID||top.GLBSID):'')+'&MODE=R&APPNAME='+appName;
          if (absURL.indexOf(':9000') === -1) {
            url = serviceUrl+params;
          }
          $http.get(url)
            .then(function success (response) {
              deferred.resolve(response);
            }, function err (response) {
              deferred.reject(response);
            });
          return deferred.promise;
        },
        updateVariant: function (appName, variantID, variant) {
          var deferred = $q.defer();
          var variantParams = '';
          var params = '&SESIONID='+ ($window.opener?($window.opener.top.GLBSID||top.GLBSID):'') + '&MODE=U&APPNAME=' + appName + '&VARIANTID=' + variantID + '&VARIANTNAME=' + variant.variantName + '&VARIANTDESC=' + variant.shortDescription + '&VARIANTPARAMS=' + JSON.stringify(variant.params);
          if (absURL.indexOf(':9000') === -1) {
            $http.post(serviceUrl, params.toString())
              .then(function success (response) {
                deferred.resolve(response);
              }, function err (response) {
                deferred.reject(response);
              });
          } else {
            $http.get(localData)
              .then(function (response) {
                deferred.resolve(response);
              });
          }
          return deferred.promise;
        },
        saveNewVariant: function (appName, variant) {
          var deferred = $q.defer();
          var params = '&SESIONID='+ ($window.opener?($window.opener.top.GLBSID||top.GLBSID):'') + '&MODE=N&APPNAME=' + appName + '&VARIANTNAME=' + variant.variantName + '&VARIANTDESC=' + variant.shortDescription + '&VARIANTPARAMS=' + JSON.stringify(variant.params);
          if (absURL.indexOf(':9000') === -1) {
            $http.post(serviceUrl, params.toString())
              .then(function success (response) {
                if (response.data.status === 'Y') {
                  deferred.resolve(response);
                } else {
                  deferred.reject(response);
                }
              }, function err (response) {
                deferred.reject(response);
              });
          } else {
            $http.get(localData)
              .then(function (response) {
                deferred.resolve(response);
              });
          }
          return deferred.promise;
        },
        deleteVariant: function (appName, variant) {
          var deferred = $q.defer();
          var params = '&SESIONID='+ ($window.opener?($window.opener.top.GLBSID||top.GLBSID):'') + '&MODE=U&APPNAME=' + appName + '&VARIANTID=' + variant.id + '&VARIANTNAME=' + variant.variantName + '&VARIANTDESC=' + variant.shortDescription + '&VARIANTPARAMS=' + JSON.stringify(variant.params);

          if (absURL.indexOf(':9000') === -1) {
            $http.post(serviceUrl, params.toString())
              .then(function success (response) {
                if (response.data.status === 'Y') {
                  deferred.resolve(response);
                } else {
                  deferred.reject(response);
                }
              }, function err (response) {
                deferred.reject(response);
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
