angular.module('confirmDeleteModule', ['ui.bootstrap'])
.controller('ConfirmDeleteController', function($scope, $uibModalInstance, model){
	$scope.dbObjectDTO = model;

	$scope.handleDelete = function(){
		$uibModalInstance.close();
	}

	$scope.handleCancel = function(){
		$uibModalInstance.dismiss();
	}
});
