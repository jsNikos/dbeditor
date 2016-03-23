var dbeditorApp = angular.module('dbeditorApp', [
    'tableMenuComponent',
    'editorComponent'
  ])
  .config(function($locationProvider) {
    $locationProvider.html5Mode({
      enabled: true,
      requireBase: false
    });
  })
  .controller('appController', ['$scope', '$http', function($scope, $http) {
    $scope.dbObjectClass = undefined;
    $scope.showEditor = false;

    $scope.handleMenuItemSelect = function(){
      $scope.showEditor = false;
    };

    $scope.handleTableSelect = function(managerClassName) {
      $http
        .get('/ws/dbeditor/api/findDBObjectClass', {
          params: {
            managerClassName: managerClassName
          }
        })
        .then(function(resp){
          $scope.dbObjectClass = resp.data;
          $scope.showEditor = true;
        })
        .catch(console.log);
    };
  }]);
