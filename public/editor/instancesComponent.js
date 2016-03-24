angular.module('instancesComponent', [])
  .component('instances', {
    templateUrl: 'editor/instances.html',
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
