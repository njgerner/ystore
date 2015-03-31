superApp.controller('SettingsProfileCtrl',
  ['$rootScope', '$scope', '$state', 'authService', 'profileService', '$location', '$stateParams', '$timeout', 
  'storeService', 'awsService', 'FileUploader', '$window',
  function($rootScope, $scope, $state, authService, profileService, $location, $stateParams, $timeout, 
  	storeService, awsService, FileUploader, $window) {
  
    $scope.uploader = new FileUploader();
    $scope.uploading = false;
    $scope.addOfficeView = false;
    $scope.showOfficeView = false;
    $scope.uploaded = false;
  	$scope.picFile = {};
    $scope.currOfficeImg = '';
		$scope.uploader.url = "/upload";	

    $scope.clearOffice = function() {
      $scope.officename = null;
      $scope.address1 = null;
      $scope.address2 = null;
      $scope.city = null;
      $scope.state = null;
      $scope.zip = null;
      $scope.currOffice = null;
      $scope.currOfficeImg = null;
      $scope.officeInd = null;
    }

    $scope.selectOffice = function(ind) {
      if ($scope.currOffice == $scope.offices[ind]) {
        $scope.currOffice = null;
        $scope.currOfficeImg = null;
        $scope.showOfficeView = false;
        return;
      }
      $scope.currOffice = $scope.offices[ind];
      $scope.officename = $scope.currOffice.name;
      $scope.address1 = $scope.currOffice.address1;
      $scope.address2 = $scope.currOffice.address2;
      $scope.city = $scope.currOffice.city;
      $scope.state = $scope.currOffice.state;
      $scope.zip = $scope.currOffice.zip;  
      $scope.officeInd = ind;
      var name = $scope.profile.id + '_' + $scope.address1.replace(/\s+/g, '');
      $scope.currOfficeImg = name.toLowerCase();
      console.log('currOfficeImg', $scope.currOfficeImg);
      $scope.showOfficeView = true;
    };

  	$scope.uploadProfileImage = function() {
  		$scope.uploading = true;
      console.log($scope.uploader);
  		$scope.uploader.queue[0].formData.push({path:'profile-images/', name:$scope.profile.id + '.jpg'});
  		$scope.uploader.queue[0].file.name = $scope.profile.id + '.jpg';
  		$scope.uploader.queue[0].upload();
      $window.location.reload();
  	};

    $scope.uploadOfficeImage = function() {
      $scope.uploading = true;
      console.log($scope.uploader);
      $scope.uploader.queue[0].formData.push({path:'office-images/', name:$scope.currOfficeImg + '.jpg'});
      $scope.uploader.queue[0].file.name = $scope.currOfficeImg + '.jpg';
      $scope.uploader.queue[0].upload();
      $window.location.reload();
    };

    $scope.addOffice = function() {
      var office = {
        "name": $scope.officename,
        "address1": $scope.address1,
        "address2": $scope.address2,
        "city": $scope.city,
        "state": $scope.state,
        "zip": $scope.zip
      };
      if ($scope.offices.length == 0) {
        office.default = true;
      }
      $scope.offices.push(office);
      $scope.profile.offices = $scope.offices;
      $scope.updateProfile();
      $scope.addOfficeView = false;
      $scope.clearOffice();
    };

    $scope.updateOffice = function() {
      var office = {
        "name": $scope.officename,
        "address1": $scope.address1,
        "address2": $scope.address2,
        "city": $scope.city,
        "state": $scope.state,
        "zip": $scope.zip
      };
      if ($scope.offices.length == 0) {
        office.default = true;
      }
      $scope.offices[$scope.officeInd] = office;
      $scope.profile.offices = $scope.offices;
      $scope.updateProfile();
      $scope.showOfficeView = false;
      $scope.clearOffice();
    };

    $scope.removeOffice = function(ind) {
      if ($window.confirm('Are you sure?')) {
        $scope.offices.splice(ind, 1);
        $scope.profile.offices = $scope.offices;
        $scope.updateProfile();
      }
    }

    $scope.toggleAddOffice = function() {
      $scope.addOfficeView = !$scope.addOfficeView;
    };

    console.log("offices in profile", $scope.offices);

  	$scope.uploader.clearQueue();

}]);