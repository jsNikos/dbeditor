var dbeditorApp = angular.module('dbeditorApp', [
  'ui.bootstrap',
  'ui.bootstrap.datetimepicker',
  'dbEditorControllers'
])
.config(function($locationProvider) {
  $locationProvider.html5Mode({enabled: true, requireBase: false});
});
