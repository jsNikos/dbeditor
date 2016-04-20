var dbeditorApp = angular.module('dbeditorApp', [
    'tableMenuComponent',
    'editorComponent',
    'serverErrorComponent',
    'editorService'
  ])
  .config(['$locationProvider', '$httpProvider',
    function($locationProvider, $httpProvider) {
      $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
      });
    }
  ])
  .controller('appController', ['$rootScope', '$scope', '$http', 'editorService',
    function($rootScope, $scope, $http, editorService) {
      $scope.selectedManagedTable = undefined; // DBObjectClassDTO (selected table from menu)
      $scope.showEditor = false;
      $scope.showMenu = false;
      $scope.selectedMenuItem = undefined; // MenuItemDTO

      function init() {
        editorService.showLoading();
        $http.get('/ws/dbeditor/api/menu')
          .then(function(resp) {
            $scope.selectedMenuItem = {
              displayName: 'tablemenu',
              menuItems: resp.data
            };
            addParents([$scope.selectedMenuItem]);
            $scope.showMenu = true;
            editorService.hideLoading();
          })
          .catch(console.log);
      }

      $scope.handleMenuItemSelect = function(menuItem) {
        $scope.showEditor = false;
        $scope.selectedMenuItem = menuItem;
        if (menuItem.isTable) {
          handleTableSelect(menuItem);
          var isChangeRootTable = (editorService.findFromUrlState(editorService.MANAGER_CLASS_NAME) !== menuItem.managerClassName);
          editorService.updateUrlState(editorService.MANAGER_CLASS_NAME, menuItem.managerClassName);
          isChangeRootTable && editorService.updateUrlState(editorService.INSTANCE_ID, null);
        }
      };

      function handleTableSelect(menuItem) {
        editorService
          .showLoading()
          .findDBObjectClass(menuItem.managerClassName)
          .then(function(resp) {
            $scope.selectedManagedTable = resp.data;
            $scope.showEditor = true;
          })
          .then(editorService.hideLoading)
          .catch(console.log);
      }

      function addParents(menuItems) {
        _.forEach(menuItems, function(menuItem) {
          if (!menuItem.isTable) {
            _.forEach(menuItem.menuItems, function(child) {
              child.parent = menuItem;
            });
            addParents(menuItem.menuItems);
          }
        });
        return menuItems;
      }

      init();
    }
  ]);
