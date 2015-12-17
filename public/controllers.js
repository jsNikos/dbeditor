var dbEditorControllers = angular.module('dbEditorControllers', []);

dbEditorControllers.controller('InstancesController', function($scope, $http) {
  $scope.objectType = 'StoreHour';
  $scope.rootInstances = undefined; // the instances tree for objectType
  $scope.rootType = {type: 'StoreHour'};

  $scope.instances = undefined; // available instances for selected type
  $scope.selectedInstance = undefined; // the instance selected for edit
  $scope.editStatus = undefined; // saved, new, changed
  $scope.breadcrumpNodes = []; // [{type: Type, instance: Instance}] the path of selected instances (breadcrump)

  $http.get('/ws/dbeditor/api/' + $scope.objectType).then(function(data) {
    $scope.rootInstances = data.data;
    $scope.instances = $scope.rootInstances;
    $scope.rootType.childObjects = $scope.rootInstances;
    $scope.breadcrumpNodes.push({
      type: $scope.rootType,
      instance: undefined,
      oldInstance: undefined
    });
  });

  $scope.$watch('selectedInstance', function(newValue, oldValue) {
    var isNew = (newValue != undefined && newValue.id == undefined);
    var isChanged = newValue != undefined && oldValue != undefined && (newValue.id === oldValue.id);
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
        url: '/ws/dbeditor/api/' + $scope.objectType,
        method: 'PUT',
        params: {
          id: $scope.selectedInstance.id
        },
        data: $scope.selectedInstance
      })
      .then(function() {
        $scope.editStatus = 'saved';
      })
      .catch(console.log);
  };

  $scope.handleCancel = function() {
    $scope.editStatus = undefined;
    var oldInstance = _.last($scope.breadcrumpNodes).oldInstance;
    var instance = _.last($scope.breadcrumpNodes).instance;
    _.assign(instance, oldInstance);
  };

  $scope.handleDelete = function(){
    //TODO
  };

  $scope.handleNew = function(){
    //TOOD
  };

  $scope.handleSelectSubtable = function(subTable) {
    $scope.instances = subTable.childObjects;
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
    leaf.oldInstance = angular.fromJson(angular.toJson(instance));
  };

  $scope.handleBreadcrumb = function(breadcrumpNode) {
    var nodeIdx = _.indexOf($scope.breadcrumpNodes, breadcrumpNode);
    _.remove($scope.breadcrumpNodes, function(node, idx) {
      return idx > nodeIdx;
    });
    $scope.instances = breadcrumpNode.type.childObjects;
    $scope.selectedInstance = breadcrumpNode.instance;
  };
});
