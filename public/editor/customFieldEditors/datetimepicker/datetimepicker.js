angular.module('datetimepicker', [
    'ui.bootstrap',
  ])
  .component('datetimepicker', {
    templateUrl: 'editor/customFieldEditors/datetimepicker/datetimepicker.html',
    controller: ['$scope', '$filter', function($scope, $filter) {
      $scope.date = undefined; // Date from datepicker
      $scope.time = undefined; // Date from timepicker
      $scope.pickerIsOpen = false;

      this.$onInit = function() {
        if(!$scope.$ctrl.dateFormat){
          $scope.$ctrl.dateFormat = moment.ISO_8601;
        }
                
        if ($scope.$ctrl.ngModel) {
          $scope.date = moment($scope.$ctrl.ngModel, $scope.$ctrl.dateFormat).toDate();
        }
        if($scope.$ctrl.ngModel && $scope.$ctrl.showTime){
          $scope.time = $scope.date;
        }
      };

      this.handleDateInputClick = function(){
        $scope.pickerIsOpen = true;
      };

      this.handleTimeChange = function(selectedDate) {
        updateModel();
      };

      this.handleDateChange = function(date){
        if($scope.$ctrl.showTime && $scope.time == undefined){
          $scope.time = $scope.date;
        }
        updateModel();
      };

      function updateModel(){
        var mtime = moment($scope.time);
        $scope.$ctrl.ngModel =
         moment($scope.date)
          .set('hour', mtime.get('hour'))
          .set('minute', mtime.get('minute'))
          .set('second', mtime.get('second'))
          .format($scope.$ctrl.dateFormat);
      }

    }],
    bindings: {
      'ngModel': '=',
      'ngDisabled': '<',
      'dateFormat': '<',
      'showTime': '<'
    }
  })
