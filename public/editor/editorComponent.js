angular.module('editorComponent', [
    'ui.bootstrap',
    'datetimepicker',
    'instancesComponent',
    'ui.select',
    'ngSanitize',
    'timeofday',
		'confirmDeleteModule'
  ])
  .component('editor', {
    templateUrl: 'editor/editor.html',
    controller: ['$scope', 'editorService', '$uibModal', function($scope, editorService, $uibModal) {
      $scope.selectedType = undefined; // DBObjectClassDTO
      $scope.selectedInstance = undefined; // DBObjectDTO
      $scope.editStatus = undefined; // saved, new, changed, canceled
      $scope.breadcrumpNodes = []; // [{type: Type, instance: Instance}] the path of selected instances (breadcrump)
      $scope.modelInited = false;

      this.$onInit = function() {
        $scope.selectedType = $scope.$ctrl.selectedManagedTable;
				_.forEach($scope.selectedType.childObjects, ensureOldInstanceProperty);
        $scope.breadcrumpNodes.push({
          type: $scope.$ctrl.selectedManagedTable,
          instance: undefined
        });
        $scope.modelInited = true;
        restoreStateFromUrl();
      };

      $scope.$watch('selectedInstance', function(newValue, oldValue) {
        var isNew = (newValue != undefined && newValue.id == undefined);
        var isChanged = newValue != undefined && oldValue != undefined && (newValue.id === oldValue.id) && $scope.editStatus !== 'canceled';
        if (isNew) {
          $scope.editStatus = 'new';
        } else if (isChanged) {
					$scope.selectedInstance._changed = true;
					flagParentsWithChanged($scope.selectedInstance);
          $scope.editStatus = 'changed';
        } else {
          $scope.editStatus = undefined;
        }
      }, true);

      // sends the instance's root-dbObject for update/insert
      // note: the server response with a root-dbOject
      // sets this root-object into the editor as selectedInstance
      $scope.handleSave = function(breadcrumpRoot) {
        var promise;
        var currId = breadcrumpRoot.instance.id;
        var isNew = (currId == undefined);
        editorService.showLoading();
        if (isNew) {
          promise = editorService.insertInstance(breadcrumpRoot.instance, $scope.$ctrl.selectedManagedTable.classType);
        } else {
          promise = editorService.updateInstance(breadcrumpRoot.instance, $scope.$ctrl.selectedManagedTable.classType);
        }

        promise
          .then(function(resp) {
            $scope.editStatus = 'saved';

            $scope.breadcrumpNodes.splice(1, $scope.breadcrumpNodes.length - 1);
            if (isNew) {
							_.remove($scope.$ctrl.selectedManagedTable.childObjects, breadcrumpRoot.instance);
              $scope.$ctrl.selectedManagedTable.childObjects.push(resp.data);
            } else {
              var instanceIdx =
                _.findIndex($scope.$ctrl.selectedManagedTable.childObjects, {
                  id: currId
                });
              $scope.$ctrl.selectedManagedTable.childObjects[instanceIdx] = resp.data;
            }

            $scope.selectedType = $scope.$ctrl.selectedManagedTable;
            $scope.selectedInstance = resp.data;

						breadcrumpRoot.instance = resp.data;
						ensureOldInstanceProperty(breadcrumpRoot.instance);
						breadcrumpRoot.type._changed = false;
						$scope.$ctrl.onRefreshChangedFlags({
							dbObjectClassDTO: $scope.$ctrl.selectedManagedTable
						});
          })
          .then(editorService.hideLoading)
          .catch(console.log);
      };

      $scope.handleCancel = function() {
				var leaf = _.last($scope.breadcrumpNodes);
        var instance = leaf.instance;

				var isNew = instance.id == undefined;
				if(isNew){
					_.remove(leaf.type.childObjects, instance);
					leaf.instance = undefined;
					$scope.selectedInstance = undefined;

				} else {
					var oldInstance = angular.fromJson(angular.toJson(instance._oldInstance));
					_.assign(instance, oldInstance);
					ensureOldInstanceProperty(instance);
				}

				instance._changed = false;
				refreshChangedFlags(leaf);
        $scope.editStatus = 'canceled';
      };

      $scope.handleDelete = function(instance) {
				confirmDelete(instance).then(function(){
					deleteInstance(instance);
				});
      };

      // requests empty-instance, adds to type.childObjects and sets this
      // into editor as selectedInstance.
      $scope.handleNew = function(selectedType) {
        editorService
          .showLoading()
          .fetchEmptyInstance(selectedType.classType, $scope.$ctrl.selectedManagedTable.classType)
          .then(function(resp) {
						$scope.selectedInstance = resp.data;
						$scope.selectedInstance._changed = true;
            var isSubTable = $scope.breadcrumpNodes.length > 1;
            var leaf = _.last($scope.breadcrumpNodes);
            leaf.type.childObjects.push($scope.selectedInstance);

            leaf.instance = $scope.selectedInstance;
						flagParentsWithChanged($scope.selectedInstance);
          })
          .then(editorService.hideLoading)
          .catch(console.log);
      };

      $scope.handleSelectSubtable = function(subTable) {
        $scope.selectedType = subTable;
        $scope.selectedInstance = undefined;
        $scope.editStatus = undefined;
        $scope.breadcrumpNodes.push({
          type: subTable,
          instance: undefined
        });
      };

      $scope.handleSelectInstance = function(instance) {
        $scope.selectedInstance = instance;
        var leaf = _.last($scope.breadcrumpNodes);
        leaf.instance = instance;
        var isRootInstance = ($scope.breadcrumpNodes.length === 1);
        if (isRootInstance) {
          editorService.updateUrlState(editorService.INSTANCE_ID, instance.id);
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

			// for subtable deletions, triggers an update on the root-dbObject.
      // for root-dbObjects calls the delete server-endpoint.
			function deleteInstance(instance){
				var isSubTable = $scope.breadcrumpNodes.length > 1;
        var leaf = _.last($scope.breadcrumpNodes);
        if (isSubTable) {
          var instanceIdx = _.findIndex(leaf.type.childObjects, {
            id: instance.id
          });
          leaf.type.childObjects.splice(instanceIdx, 1);
          $scope.handleSave($scope.breadcrumpNodes[0]);
        } else {
          editorService.showLoading();
          editorService.deleteInstance(instance, $scope.$ctrl.selectedManagedTable.classType)
            .then(function(resp) {
              _.remove($scope.$ctrl.selectedManagedTable.childObjects, {
                id: instance.id
              });
              leaf.instance = undefined;
              $scope.selectedInstance = undefined;
            })
            .then(editorService.hideLoading)
            .catch(console.log);
        }
			}

			function confirmDelete(dbObjectDTO){
				return $uibModal
          .open({
            animation: true,
            templateUrl: 'editor/confirmDelete/confirmDelete.html',
            controller: 'ConfirmDeleteController',
            size: 'sm',
            resolve: {
              model: function() {
                return dbObjectDTO;
              }
            }
          })
          .result;
			}

			function refreshChangedFlags(breadcrumpNode){
				var hasChanges = _.find(breadcrumpNode.type.childObjects, {
					_changed: true
				});
				if(hasChanges){
					return;
				}

				breadcrumpNode.type._changed = false;
				var nodeIdx = _.indexOf($scope.breadcrumpNodes, breadcrumpNode);
				if(nodeIdx > 0){
					$scope.breadcrumpNodes[nodeIdx-1].instance._changed = false;
					refreshChangedFlags($scope.breadcrumpNodes[nodeIdx-1]);
				} else {
					$scope.$ctrl.onRefreshChangedFlags({
						dbObjectClassDTO: $scope.$ctrl.selectedManagedTable
					});
				}
			}

      function restoreStateFromUrl() {
        var id = editorService.findFromUrlState(editorService.INSTANCE_ID);
        if (id) {
          var instance = _.find($scope.selectedType.childObjects, {
            id: id
          });
          instance && $scope.handleSelectInstance(instance);
        }
      }

			function ensureOldInstanceProperty(dbObjectDTO) {
				if(!dbObjectDTO._oldInstance){
					dbObjectDTO._oldInstance = angular.fromJson(angular.toJson(dbObjectDTO));
				}
				_.forEach(dbObjectDTO.subTables, function(dbObjectClassDTO){
					_.forEach(dbObjectClassDTO.childObjects, ensureOldInstanceProperty);
				});
			}

			function flagParentsWithChanged(dbObjectDTO){
				_.forEach($scope.breadcrumpNodes, function(breadcrumpNode){
					breadcrumpNode.type._changed = true;
					breadcrumpNode.instance._changed = true;
				});
				$scope.$ctrl.onFlagWithChanged({
					dbObjectClassDTO: $scope.breadcrumpNodes[0].type
				});
			}

    }],
    bindings: {
      selectedManagedTable: '<',
      menuItem: '<',
			onFlagWithChanged: '&',
			onRefreshChangedFlags: '&'
    }
  });
