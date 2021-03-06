function HomeController() {
}

function BoxLoginController($stateParams) {
    this.loginUrl = $stateParams.url;
}

function BoxListController(Restangular, $modal, $http) {
    var _this = this;

    this.inactiveCommunities = null;
    this.isLoading = function () {
        return this.inactiveCommunities === null;
    };

    var baseInactives = Restangular.all('arc2box/communities');

    // Handle filters
    this.lastActivity = 900;
    this.limit = 20;
    this.filterText = null;
    this.reload = function () {
        _this.isSubmitting = true;
        // User clicked the "Over 18 months" checkbox or the search box
        var params = {};
        // Only send query string parameters if they are not null
        if (this.lastActivity || this.lastActivity === 0) {
            params.last_activity = this.lastActivity;
        }
        if (this.limit) {
            params.limit = this.limit;
        }
        if (this.filterText) {
            params.filter = this.filterText;
        }

        baseInactives.getList(params)
            .then(
            function (success) {
                _this.isSubmitting = false;
                _this.inactiveCommunities = success;
            },
            function (failure) {
                console.debug('failure', failure);
            }
        );
    };
    // Let's go ahead and load this the first time
    this.reload();

    this.setStatus = function (target, action) {
        var url = '/arc2box/communities/' + target.name;
        $http.patch(url, {action: action})
            .success(
            function () {
                console.debug('success setting ' + target.name + ' to ' + action);
                _this.reload();
            })
            .error(
            function (error) {
                console.debug('error', error);
            }
        )
    };


    this.showLog = function (target) {
        var modalInstance = $modal.open(
            {
                templateUrl: 'myModalContent.html',
                controller: ModalController,
                controllerAs: 'ctrl',
                size: 'lg',
                resolve: {
                    target: function () {
                        return target;
                    }
                }
            });
    }
}

function ModalController($modalInstance, target, $http) {
    var _this = this;
    this.logEntries = [];
    this.updateLog = function () {
        var url = '/arc2box/communities/' + target.name;
        $http.get(url)
            .success(function (success) {
                         _this.logEntries = success.log;
                     })
            .error(function (error) {
                       console.log('failure on getting log entries');
                   });
    };
    this.updateLog();

    this.close = function () {
        $modalInstance.dismiss();
    };
}

exports.HomeController = HomeController;
exports.BoxLoginController = BoxLoginController;
exports.ModalController = ModalController;
exports.BoxListController = BoxListController;