angular.module('tableMenuComponent', [
    'ui.bootstrap',
    'ui.select',
    'ngSanitize'
  ])
  .component('tablemenu', {
    templateUrl: 'tablemenu/tablemenu.html',
    controller: ['$http', '$scope', 'editorService', function($http, $scope, editorService) {
      $scope.breadcrump = [];
      $scope.showMenuItems = true;
      $scope.flattenedMenuItems = undefined;
      $scope.selectedTable = undefined;

      this.$onInit = function() {
        $scope.breadcrump.push($scope.$ctrl.selectedMenuItem);
        $scope.flattenedMenuItems = flattenMenu($scope.$ctrl.selectedMenuItem.menuItems);
        restoreStateFromUrl();
      };

      $scope.handleItemSelect = function(menuItem) {
        if (!menuItem || !menuItem.enabled) {
          return;
        }
        $scope.$ctrl.onSelectMenuItem({
          menuItem: menuItem
        });
        if (!menuItem.isTable) {
          $scope.breadcrump.push(menuItem);
        } else {
          $scope.selectedTable = undefined;
          updateBreadcrump(menuItem);
          $scope.showMenuItems = false;
        }
      };

      $scope.handleBreadCrumpSelect = function($index) {
        $scope.breadcrump.splice($index + 1, $scope.breadcrump.length - $index - 1);
        $scope.$ctrl.onSelectMenuItem({
          menuItem: $scope.breadcrump[$index]
        });
        $scope.showMenuItems = true;
      };

      function restoreStateFromUrl() {
        var managerClassName = editorService.findFromUrlState(editorService.MANAGER_CLASS_NAME);
        if (managerClassName) {
          var menuItem = _.find($scope.flattenedMenuItems, {
            managerClassName: managerClassName
          });
          menuItem && $scope.handleItemSelect(menuItem);
        }
      }

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
      selectedMenuItem: '<',
      onSelectMenuItem: '&'
    }
  });
