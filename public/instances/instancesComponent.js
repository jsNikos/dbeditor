angular.module('instancesComponent', [])
  .component('instances', {
    templateUrl: 'instances/instances.html',
    controller: ['$scope', function($scope) {

      $scope.handleSelectInstance = function(instance){
        $scope.$ctrl.onSelectInstance({
          instance: instance
        });
      };
    }],
    bindings: {
      selectedType: '<',
      selectedInstance: '<',
      modelInited: '<',
      onSelectInstance: '&'
    }
  });
