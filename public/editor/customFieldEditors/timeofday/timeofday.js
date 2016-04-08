angular.module('timeofday', [
    'ui.bootstrap',
  ])
  .component('timeofday', {
    templateUrl: 'editor/customFieldEditors/timeofday/timeofday.html',
    controller: ['$scope', '$filter', function($scope, $filter) {
      $scope.selectedDate = undefined;

      this.$onInit = function() {
        if ($scope.$ctrl.ngModel) {
          var date = new Date();
          date.setMinutes($scope.$ctrl.ngModel.minutes);
          date.setHours($scope.$ctrl.ngModel.hours);
          $scope.selectedDate = date;
        }
      };

      this.handleChange = function(selectedDate) {
        $scope.$ctrl.ngModel.minutes = selectedDate.getMinutes();
        $scope.$ctrl.ngModel.hours = selectedDate.getHours();
        $scope.$ctrl.ngModel.displayValue = $filter('lowercase')($filter('date')(selectedDate, 'h:mm a'));
      };

    }],
    bindings: {
      'ngModel': '=' // TimeOfDayDTO
    }
  })
