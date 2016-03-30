var dbeditorApp = angular.module('dbeditorApp', [
    'tableMenuComponent',
    'editorComponent',
    'serverErrorComponent'
  ])
  .config(function($locationProvider) {
    $locationProvider.html5Mode({
      enabled: true,
      requireBase: false
    });
  })
  .controller('appController', ['$scope', '$http', function($scope, $http) {
    $scope.dbObjectClass = undefined; // DBObjectClassDTO
    $scope.showEditor = false;
    $scope.selectedMenuItem = undefined; // MenuItemDTO

    $scope.handleMenuItemSelect = function(){
      $scope.showEditor = false;
    };

    $scope.handleTableSelect = function(menuItem) {
      $http
        .get('/ws/dbeditor/api/findDBObjectClass', {
          params: {
            managerClassName: menuItem.managerClassName
          }
        })
        .then(function(resp){
          $scope.dbObjectClass = resp.data;
          $scope.showEditor = true;
          $scope.selectedMenuItem = menuItem;
        })
        .catch(console.log);
    };
  }]);
