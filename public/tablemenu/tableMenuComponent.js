angular.module('tableMenuComponent', ['ui.select2'])
  .component('tablemenu', {
    templateUrl: 'tablemenu/tablemenu.html',
    controller: ['$http', '$scope', function($http, $scope) {
      $scope.breadcrump = [];
      $scope.selectedItem = undefined;
      $scope.showMenuItems = true;
      $scope.flattenedMenuItems = undefined;
      $scope.selectedTableIndex = undefined;

      this.$onInit = function() {
        $http.get('/ws/dbeditor/api/menu')
          .then(function(resp) {
            $scope.selectedItem = {
              displayName: 'tablemenu',
              menuItems: resp.data
            };
            $scope.breadcrump.push($scope.selectedItem);
            $scope.flattenedMenuItems = flattenMenu(resp.data);
            addParents([$scope.selectedItem]);
          })
          .catch(console.log);
      };

      $scope.handleItemSelect = function(menuItem) {
        if (!menuItem || !menuItem.enabled) {
          return;
        }
        $scope.$ctrl.onSelectMenuItem();
        if (!menuItem.isTable) {
          $scope.selectedItem = menuItem;
          $scope.breadcrump.push(menuItem);
        } else {
          $scope.selectedTableIndex = undefined;
          updateBreadcrump(menuItem);

          $scope.$ctrl.onSelectTable({
            managerClassName: menuItem.managerClassName,
            displayName: menuItem.displayName
          });
          $scope.showMenuItems = false;
        }
      };

      $scope.handleBreadCrumpSelect = function($index) {
        $scope.breadcrump.splice($index + 1, $scope.breadcrump.length - $index - 1);
        $scope.selectedItem = $scope.breadcrump[$index];
        $scope.$ctrl.onSelectBreadCrump();
        $scope.showMenuItems = true;
      };

      function updateBreadcrump(selectedMenuItem) {
        $scope.breadcrump.splice(0, $scope.breadcrump.length);
        Array.prototype.push.apply($scope.breadcrump, findPathTo(selectedMenuItem));
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

      function findPathTo(menuItem) {
        var item = menuItem;
        var path = [];
        while (item.parent) {
          item = item.parent;
          path.push(item);
        }
        return _.reverse(path);
      }

    }],
    bindings: {
      onSelectTable: '&',
      onSelectBreadCrump: '&',
      onSelectMenuItem: '&'
    }
  });
