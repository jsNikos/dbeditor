angular.module('tableMenuComponent', [
    'ui.bootstrap',
    'ui.select',
    'ngSanitize'
  ])
  .component('tablemenu', {
    templateUrl: 'tablemenu/tablemenu.html',
    controller: ['$scope', 'editorService', function($scope, editorService) {
      $scope.breadcrump = [];
      $scope.showMenuItems = true;
      $scope.tableMenuItems = undefined; // flattenedMenuItems cannot be used in ui-select because of parent-ref
      $scope.selectedTable = undefined; // {managerClassName, displayName}

      this.$onInit = function() {
        $scope.breadcrump.push($scope.$ctrl.selectedMenuItem);
        $scope.tableMenuItems = findTableMenuItems($scope.$ctrl.flattenedMenuItems);
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

      $scope.findMenuItem = function(selectedTable) {
        return selectedTable && _.find($scope.$ctrl.flattenedMenuItems, {
          managerClassName: selectedTable.managerClassName
        });
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
          var menuItem = _.find($scope.$ctrl.flattenedMenuItems, {
            managerClassName: managerClassName
          });
          menuItem && $scope.handleItemSelect(menuItem);
        }
      }

      function updateBreadcrump(selectedMenuItem) {
        $scope.breadcrump.splice(0, $scope.breadcrump.length);
        Array.prototype.push.apply($scope.breadcrump, findPathTo(selectedMenuItem));
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

      function findTableMenuItems(flattenedMenuItems) {
        return _.map(flattenedMenuItems, function(item) {
          return {
            managerClassName: item.managerClassName,
            displayName: item.displayName
          };
        });
      }

    }],
    bindings: {
      selectedMenuItem: '<',
			flattenedMenuItems: '<',
      onSelectMenuItem: '&'
    }
  });
