angular.module('menuComponent', [])
  .component('editormenu', {
    templateUrl: 'menu.html',
    controller: ['$http', '$scope', '$timeout', function($http, $scope, $timeout) {
      $scope.breadcrump = [];
      $scope.selectedItem = undefined;
      $scope.showMenuItems = true;

      this.$onInit = function() {
        $http.get('/ws/dbeditor/api/menu')
          .then(function(resp) {
            $scope.selectedItem = {
              displayName: 'menu',
              menuItems: resp.data
            };
            $scope.breadcrump.push($scope.selectedItem);
          })
          .catch(console.log);
      };

      $scope.handleItemSelect = function(menuItem) {
        $scope.$ctrl.onSelectMenuItem();
        if (!menuItem.managerClassName) {
          $scope.selectedItem = menuItem;
          $scope.breadcrump.push(menuItem);
        } else {
          $scope.$ctrl.onSelectTable({
            managerClassName: menuItem.managerClassName
          });
          $scope.showMenuItems = false;
        }
      };

      $scope.handleBreadCrumpSelect = function($index) {
        $scope.breadcrump.splice($index + 1, $scope.breadcrump.length - $index - 1);
        $scope.selectedItem = $scope.breadcrump[$index];
        $scope.$ctrl.onSelectBreadCrump();
        if($index === 0 && !$scope.showMenuItems){
          $scope.showMenuItems = true;
        }
      };

    }],
    bindings: {
      onSelectTable: '&',
      onSelectBreadCrump: '&',
      onSelectMenuItem: '&'
    }
  });
