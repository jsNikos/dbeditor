angular.module('editorService', [])
.factory('editorService', ['$http', function($http){
  return new EditorService();

  function EditorService(){
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
