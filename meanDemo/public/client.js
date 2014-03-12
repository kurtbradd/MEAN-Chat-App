var app = angular.module('myApp', []);

app.directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.ngEnter);
                });
                event.preventDefault();
            }
        });
    };
});

app.factory('MessageCreator', ['$http', function ($http){
	return {
		postMessage: function (message, callback) {
			$http.post('/message', message)
			.success(function(data, status){
				callback(data, false);
			}).
			error(function(data, status) {
				callback(data, true);
			});
		}
	}
}])

app.controller('ChatCtrl', ['$scope', 'MessageCreator', function ($scope, MessageCreator) {
	$scope.userName = '';
	$scope.message = '';
	$scope.filterText = '';
	$scope.messages = [];
	var socket = io.connect();

	//recieve new messages from chat
	socket.on('receiveMessage', function (data) {
		$scope.messages.unshift(data);
		$scope.$apply();
	});

	//load previous messages from chat
	socket.on('pastMessages', function (data) {
		$scope.messages = data.reverse();
		// data.forEach(function (message) {
		// 	$scope.messages.unshift(message);
		// })
		$scope.$apply();
	});

	//send a message to the server
	$scope.sendMessage = function () {
		if ($scope.userName == '') {
			window.alert('Choose a username');
			return;
		}

		if (!$scope.message == '') {
			var chatMessage = {
				'username' : $scope.userName,
				'message' : $scope.message
			};

			MessageCreator.postMessage(chatMessage, function (result, error) {
				if (error) {
					window.alert('Error saving to DB');
					return;
				}
				$scope.message = '';
			});
		}
	};
}]);