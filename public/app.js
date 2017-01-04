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
  .controller('appController', ['$rootScope', '$scope', '$http', 'editorService', '$q', '$timeout',
    function($rootScope, $scope, $http, editorService, $q, $timeout) {
			$scope.logo = undefined;
      $scope.selectedManagedTable = undefined; // DBObjectClassDTO (selected table from menu)
      $scope.showEditor = false;
      $scope.showMenu = false;
			$scope.flattenedMenuItems = undefined;
      $scope.selectedMenuItem = undefined; // MenuItemDTO

      function init() {
        editorService.showLoading();
				$http.get('/ws/dbeditor/api/findLogo')
					.then(function(resp){
						$scope.logo = resp.data.logo;
					});

        $http.get('/ws/dbeditor/api/menu')
          .then(function(resp) {
            $scope.selectedMenuItem = {
              displayName: 'tablemenu',
              menuItems: resp.data
            };
            addParents([$scope.selectedMenuItem]);
						$scope.flattenedMenuItems = flattenMenu($scope.selectedMenuItem.menuItems);

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
          editorService.updateUrlState(editorService.MANAGER_CLASS_NAME, menuItem.managerClassName);
          editorService.updateUrlState(editorService.INSTANCE_ID, null);
        } else {
					editorService.updateUrlState(editorService.MANAGER_CLASS_NAME, null);
					editorService.updateUrlState(editorService.INSTANCE_ID, null);
				}
      };

			$scope.handleFlagWithChanged = function(dbObjectClassDTO) {
				var menuItem = findMenuItemByManagedClass(dbObjectClassDTO);
				while(menuItem != null){
					menuItem._changed = true;
					menuItem = menuItem.parent;
				}
			};

			$scope.handleRefreshChangedFlags = function(dbObjectClassDTO) {
				var hasChanges = _.find(dbObjectClassDTO.childObjects, {
					_changed: true
				});
				if(hasChanges){
					return;
				}
				dbObjectClassDTO._changed = false;
				refreshChangedFlags(findMenuItemByManagedClass(dbObjectClassDTO));
			};

      function handleTableSelect(menuItem) {
				$scope.showEditor = false;
				$q(function(resolve, reject){
					if(!menuItem._managedTable){
						addManagedTable(menuItem)
							.then(resolve, reject)
							.catch(console.log);
					} else {
						$timeout().then(resolve);
					}
				})
				.then(function(){
					$scope.selectedManagedTable = menuItem._managedTable;
					$scope.showEditor = true;
				})
        .catch(console.log);
      }

			function refreshChangedFlags(menuItem){
				var hasChanges = _.find(menuItem.menuItems, {
					_changed: true
				});
				if(hasChanges){
					return;
				}
				menuItem._changed = false;
				if(menuItem.parent){
					refreshChangedFlags(menuItem.parent);
				}
			}

			function findMenuItemByManagedClass(dbObjectClassDTO){
				return _.find($scope.flattenedMenuItems, {
					managerClassName: dbObjectClassDTO.managerClassName
				});
			}

			function addManagedTable(menuItem){
				return editorService
					.showLoading()
					.findDBObjectClass(menuItem.managerClassName)
					.then(function(resp) {
						menuItem._managedTable = resp.data;
					})
					.then(editorService.hideLoading);
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

			function flattenMenu(menuItems) {
        var tables = [];
        _.forEach(menuItems, function(menuItem) {
          if (menuItem.isTable && menuItem.enabled) {
            tables.push(menuItem);
          } else {
            Array.prototype.push.apply(tables, flattenMenu(menuItem.menuItems));
          }
        });
        return tables;
      }

      init();
    }
  ]);
