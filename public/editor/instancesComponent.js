angular.module('instancesComponent', [])
  .component('instances', {
    templateUrl: 'editor/instances.html',
    controller: ['$scope', function($scope) {
      $scope.selectedInstance = undefined;

      $scope.handleSelectInstance = function(instance){
        $scope.selectedInstance = instance;
        $scope.$ctrl.onSelectInstance({
          instance: instance
        });
      };
    }],
    bindings: {
      selectedType: '<',
      modelInited: '<',
      onSelectInstance: '&'
    }
  });
