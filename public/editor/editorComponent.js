angular.module('editorComponent', [
    'ui.bootstrap',
    'ui.bootstrap.datetimepicker',
  ])
  .component('editor', {
    templateUrl: 'editor/editor.html',
    controller: ['$http', '$scope', function($http, $scope) {
      $scope.selectedType = undefined; // selected type
      $scope.selectedInstance = undefined; // the instance selected for edit
      $scope.editStatus = undefined; // saved, new, changed, canceled
      $scope.breadcrumpNodes = []; // [{type: Type, instance: Instance}] the path of selected instances (breadcrump)
      $scope.modelInited = false;

      this.$onInit = function() {
        $scope.selectedType = $scope.$ctrl.dbObjectClass;
        $scope.breadcrumpNodes.push({
          type: $scope.selectedType,
          instance: undefined,
          oldInstance: undefined
        });
        $scope.modelInited = true;
      };

      $scope.$watch('selectedInstance', function(newValue, oldValue) {
        var isNew = (newValue != undefined && newValue.id == undefined);
        var isChanged = newValue != undefined && oldValue != undefined && (newValue.id === oldValue.id) && $scope.editStatus !== 'canceled';
        if (isNew) {
          $scope.editStatus = 'new';
        } else if (isChanged) {
          $scope.editStatus = 'changed';
        } else {
          $scope.editStatus = undefined;
        }
      }, true);

      $scope.findEditor = function(field) {
        if (field.type === 'java.lang.String') {
          return 'text';
        }
        if (field.type === 'ads.util.Day') {
          return 'datetime';
        }
        if (field.type === 'boolean') {
          return 'checkbox';
        }
        if (field.allowedValues && field.allowedValues.length > 0) {
          return 'enum';
        }
      };

      $scope.handleSave = function() {
        $http({
            url: '/ws/dbeditor/api/' + $scope.$ctrl.dbObjectClass.type,
            method: 'PUT',
            params: {
              id: $scope.selectedInstance.id
            },
            data: $scope.breadcrumpNodes[0].instance
          })
          .then(function() {
            $scope.editStatus = 'saved';
          })
          .catch(console.log);
      };

      $scope.handleCancel = function() {
        var oldInstance = _.last($scope.breadcrumpNodes).oldInstance;
        var instance = _.last($scope.breadcrumpNodes).instance;
        _.assign(instance, angular.fromJson(angular.toJson(oldInstance)));
        $scope.editStatus = 'canceled';
      };

      $scope.handleDelete = function() {
        //TODO
      };

      $scope.handleNew = function() {
        //TODO
      };

      $scope.handleSelectSubtable = function(subTable) {
        $scope.selectedType = subTable;
        $scope.selectedInstance = undefined;
        $scope.editStatus = undefined;
        $scope.breadcrumpNodes.push({
          type: subTable,
          instance: undefined,
          oldInstance: undefined
        });
      };

      $scope.handleSelectInstance = function(instance) {
        $scope.selectedInstance = instance;
        var leaf = _.last($scope.breadcrumpNodes);
        leaf.instance = instance;
        if (leaf.oldInstance == undefined) {
          leaf.oldInstance = angular.fromJson(angular.toJson(instance));
        }
      };

      $scope.handleBreadcrumb = function(breadcrumpNode) {
        var nodeIdx = _.indexOf($scope.breadcrumpNodes, breadcrumpNode);
        _.remove($scope.breadcrumpNodes, function(node, idx) {
          return idx > nodeIdx;
        });
        $scope.selectedType = breadcrumpNode.type;
        $scope.selectedInstance = breadcrumpNode.instance;
      };
    }],
    bindings: {
      dbObjectClass: '<'
    }
  });
