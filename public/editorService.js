angular.module('editorService', ['ui.bootstrap'])
  .factory('editorService', ['$http', '$location', '$uibModal',
    function($http, $location, $uibModal) {
      return new EditorService();

      function EditorService() {
        var scope = this;

        // url-state properties
        this.MANAGER_CLASS_NAME = 'managerClassName';
        this.INSTANCE_ID = 'instanceId';

        this.loader = undefined;

        this.updateUrlState = function(name, value) {
          $location.search(name, value);
        };

        this.findFromUrlState = function(name) {
          return $location.search()[name];
        };

        this.showLoading = function() {
          if (scope.loader) {
            scope.loader.close();
          }
          scope.loader = $uibModal.open({
            animation: false,
            template: '<div class="loader"></div>',
            windowTopClass: 'loading'
          });
          return this;
        };

        this.hideLoading = function() {
          if (scope.loader) {
            scope.loader.close();
          }
          return this;
        };

        // only for root-dbObjects
        this.updateInstance = function(instance, classType) {
          return $http({
            url: '/ws/dbeditor/api/',
            method: 'PUT',
            params: {
              id: instance.id,
              classType: classType
            },
            data: instance
          });
        };

        // only for root-dbObjects
        this.insertInstance = function(instance, classType) {
          return $http({
            url: '/ws/dbeditor/api/',
            method: 'POST',
            params: {
              classType: classType
            },
            data: instance
          });
        };

        // only for root-dbObjects
        this.deleteInstance = function(instance, classType) {
          return $http({
            url: '/ws/dbeditor/api/',
            method: 'DELETE',
            params: {
              id: instance.id,
              classType: classType
            }
          });
        };

        this.fetchEmptyInstance = function(classType, managedClassType) {
          return $http({
            url: '/ws/dbeditor/api/empty',
            method: 'GET',
            params: {
              classType: classType,
              managedClassType: managedClassType
            }
          });
        };

        this.findDBObjectClass = function(managerClassName) {
          return $http
            .get('/ws/dbeditor/api/findDBObjectClass', {
              params: {
                managerClassName: managerClassName
              }
            });
        };

      };
    }
  ])
