angular.module('editorComponent', [
    'ui.bootstrap',
    'ui.bootstrap.datetimepicker',
    'instancesComponent',
  ])
  .component('editor', {
    templateUrl: 'editor/editor.html',
    controller: ['$http', '$scope', function($http, $scope) {
      $scope.selectedType = undefined; // DBObjectClassDTO
      $scope.selectedInstance = undefined; // DBObjectDTO
      $scope.editStatus = undefined; // saved, new, changed, canceled
      $scope.breadcrumpNodes = []; // [{type: Type, instance: Instance}] the path of selected instances (breadcrump)
      $scope.modelInited = false;

      this.$onInit = function() {
        $scope.selectedType = $scope.$ctrl.dbObjectClass;
        $scope.breadcrumpNodes.push({
          type: $scope.$ctrl.dbObjectClass,
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

      // sends the instance's root-dbObject for update/insert
      // note: the server response with a root-dbOject
      // sets this root-object into the editor as selectedInstance
      $scope.handleSave = function(breadcrumpRoot) {
        var promise;
        var currId = breadcrumpRoot.instance.id;
        var isNew = (currId == undefined);
        if (isNew) {
          promise = insertInstance(breadcrumpRoot.instance);
        } else {
          promise = updateInstance(breadcrumpRoot.instance);
        }

        promise
          .then(function(resp) {
            $scope.editStatus = 'saved';
            breadcrumpRoot.instance = resp.data;
            breadcrumpRoot.oldInstance = angular.fromJson(angular.toJson(resp.data));
            $scope.breadcrumpNodes.splice(1, $scope.breadcrumpNodes - 1);
            if (isNew) {
              $scope.$ctrl.dbObjectClass.childObjects.push(resp.data);
            } else {
              var instanceIdx =
                _.findIndex($scope.$ctrl.dbObjectClass.childObjects, {
                  id: currId
                });
              $scope.$ctrl.dbObjectClass.childObjects[instanceIdx] = resp.data;
            }

            $scope.selectedType = $scope.$ctrl.dbObjectClass;
            $scope.selectedInstance = resp.data;
          })
          .catch(console.log);
      };

      // only for root-dbObjects
      function updateInstance(instance) {
        return $http({
          url: '/ws/dbeditor/api/' + $scope.$ctrl.dbObjectClass.type,
          method: 'PUT',
          params: {
            id: instance.id
          },
          data: instance
        });
      }

      // only for root-dbObjects
      function insertInstance(instance) {
        return $http({
          url: '/ws/dbeditor/api/' + $scope.$ctrl.dbObjectClass.type,
          method: 'POST',
          data: instance
        });
      }

      // only for root-dbObjects
      function deleteInstance(instance) {
        return $http({
          url: '/ws/dbeditor/api/' + $scope.$ctrl.dbObjectClass.type,
          method: 'DELETE',
          params: {
            id: instance.id
          }
        });
      }

      $scope.handleCancel = function() {
        var oldInstance = _.last($scope.breadcrumpNodes).oldInstance;
        var instance = _.last($scope.breadcrumpNodes).instance;
        _.assign(instance, angular.fromJson(angular.toJson(oldInstance)));
        $scope.editStatus = 'canceled';
      };

      // for subtable deletions, triggers an update on the root-dbObject.
      // for root-dbObjects calls the delete server-endpoint.
      $scope.handleDelete = function(instance) {
        var isSubTable = $scope.breadcrumpNodes.length > 1;
        var leaf = _.last($scope.breadcrumpNodes);
        if (isSubTable) {
          var instanceIdx = _.findIndex(leaf.type.childObjects, {
            id: instance.id
          });
          leaf.type.childObjects.splice(instanceIdx, 1);
          $scope.handleSave($scope.breadcrumpNodes[0]);
        } else {
          deleteInstance(instance).then(function(resp) {
            _.remove($scope.$ctrl.dbObjectClass.childObjects, {
              id: instance.id
            });
            leaf.instance = undefined;
            leaf.oldInstance = undefined;
            $scope.selectedInstance = undefined;
          });
        }
      };

      // requests empty-instance, adds to type.childObjects and sets this
      // into editor as selectedInstance.
      $scope.handleNew = function(selectedType) {
        $http({
            url: '/ws/dbeditor/api/empty/' + selectedType.type,
            method: 'GET'
          })
          .then(function(resp) {
            $scope.selectedInstance = resp.data;
            var isSubTable = $scope.breadcrumpNodes.length > 1;
            var leaf = _.last($scope.breadcrumpNodes);
            if (isSubTable) {
              leaf.type.childObjects.push(resp.data);
            }
            leaf.instance = resp.data;
            leaf.oldInstance == undefined;
          })
          .catch(console.log);
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
