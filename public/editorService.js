angular.module('editorService', [])
  .factory('editorService', ['$http', '$location', function($http, $location) {
    return new EditorService();

    function EditorService() {
      // url-state properties
      this.MANAGER_CLASS_NAME = 'managerClassName';
      this.INSTANCE_ID = 'instanceId';

      this.updateUrlState = function(name, value) {
        $location.search(name, value);
      };

      this.findFromUrlState = function(name) {
        return $location.search()[name];
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
      }
    };
  }])
