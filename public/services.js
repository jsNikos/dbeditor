var dbeditorServices = angular.module('dbeditorServices', ['ngResource']);

dbeditorServices.factory('DBObjectService', ['$resource',
  function($resource) {
    return $resource('/ws/dbeditor/api/CalendarEvent', {}, {
      query: {
        method: 'GET',
        params: {},
        isArray: true
      }
    });
  }
]);
