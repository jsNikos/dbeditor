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
  .controller('appController', ['$scope', '$http', '$location', function($scope, $http, $location) {
    $scope.dbObjectClass = undefined; // DBObjectClassDTO (selected table from menu)
    $scope.showEditor = false;
    $scope.selectedMenuItem = undefined; // MenuItemDTO

    function init(){
      console.log($location.search());
      // tablename=dbObjectClass.tableName&id=selectedInstance.id (only for route objects)
      //TODO restore state from url
    }

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

    init();
  }]);
