<?PHP
$headers = getallheaders();

if (isset($_GET['trigram']) && !empty($_GET['trigram'])) {
    $trigram  = $_GET['trigram'];
    $obj      = new AMSMobile();
    $jsondata = $obj->getAMSData($trigram);
    echo $jsondata;
}

else if ($_SERVER['REQUEST_METHOD'] == "POST") {
    
    //check for formsubmmion
    //	else {
    
    
    $obj          = json_decode(file_get_contents("php://input"), true);
    $data         = $obj["postParams"];
    $methodCalled = $data["method"];
    
    switch ($methodCalled) {
        case "validate":
            $arr      = array();
            $u        = $data['user'];
            $p        = $data["pwd"];
            $remember = $data["rememberme"];
            $obj      = new AMSMobile();
            $result   = $obj->fnVerifyUser($u, $p);
            
            if ($result == true && $remember == true) {
                $obj->saveCookies($u, $p);
            }
            $arr["result"] = $result;
            echo json_encode($arr);
            break;
        
        case "applyLeave":
            $obj    = new AMSMobile();
            $result = $obj->fnApplyLeave($data);
            echo $result;
            break;
        
        case "selfswipehours":
            $obj    = new AMSMobile();
            $result = $obj->fnGetSelfSwipeData($data);
            echo $result;
            break;
            
    }
    
} else {
    //echo 'error_invalid_request';
    echo $_SERVER['REQUEST_METHOD'];
}

class AMSMobile
{
    
    
    private function sanitize($text)
    {
        $text = htmlspecialchars($text, ENT_QUOTES);
        $text = str_replace("\n\r", "\n", $text);
        $text = str_replace("\r\n", "\n", $text);
        $text = str_replace("\n", "<br>", $text);
        return $text;
    }
    
    
    // it returns tree data
    public function getAMSData($trigram)
    {
        try {
            //consume by new ams WebService
            $url       = "http://intranetplp/AMStest/WebService/AMSService.asmx?wsdl";
            $client    = new SoapClient($url, array(
                'trace' => true
            ));
            $userName  = 'k8q';
            $result    = $client->GetLeaveDetailsbyEmployeeTrigram(array(
                'iUserName' => $userName,
                'iEmployeeTrigram' => $trigram
            ));
            $leaveData = $result->GetLeaveDetailsbyEmployeeTrigramResult->EmployeeLeaveDetailsViewModel;
            return json_encode($leaveData);
        }
        catch (Exception $e) {
            return $e->getMessage();
        }
    }
    
    //authenticate user
    
    public function fnVerifyUser($u, $p)
    {
        try {
            
            //authenticate user
            $url      = "https://intranetplp/SSOServiceDSOne/Service.asmx?wsdl";
            $client   = new SoapClient($url, array(
                'trace' => true
            ));
            $result   = $client->AuthenticateUser(array(
                'UserId' => $u,
                'Password' => $p
            ));
            $userInfo = $result->AuthenticateUserResult;
            return $userInfo;
            
            
        }
        catch (Exception $e) {
            
            return false;
        }
    }
    
    public function saveCookies($u, $p)
    {
        try {
            
            // if(!isset($_COOKIE['amsmobile'] ['username']) && !isset($_COOKIE['amsmobile'] ['password']))
            
            if (!isset($_COOKIE['amsmobile']['username']))
                setcookie("amsmobile[username]", $u, time() + 60 * 60 * 8);
            //setcookie("amsmobile[password]", $p, time() + 3600*24*7);
        }
        catch (Exception $e) {
            
            return $e->getMessage();
            
        }
        
        
    }
    
    //apply leave module 
    
    public function fnApplyLeave($parameters)
    {
        try {
            
            $leaveType = $this->sanitize(trim($parameters["leaveType"]));
            $halfLeave = $this->sanitize(trim($parameters["halfLeave"]));
            $sDate     = $this->sanitize(trim($parameters["sDate"]));
            $eDate     = $this->sanitize(trim($parameters["eDate"]));
            $comment   = $this->sanitize(trim($parameters["comment"]));
            $userName  = $this->sanitize(trim($parameters["userName"]));
            $salCode   = (int) $this->sanitize(trim($parameters["salCode"]));
            
            $dates  = DateTime::createFromFormat('d/m/Y', $sDate);
            $datee  = DateTime::createFromFormat('d/m/Y', $eDate);
            $hf     = filter_var($halfLeave, FILTER_VALIDATE_BOOLEAN);
            $sDate1 = $dates->format('Y-m-d');
            $eDate1 = $datee->format('Y-m-d');
                    
            
            //consume by new ams WebService
            $url            = "http://intranetplp/AMStest/WebService/AMSService.asmx?wsdl";
            $client         = new SoapClient($url, array(
                'trace' => true
            ));
            $result         = $client->ApplyLeaveByEmployee(array(
                'iUserName' => $userName,
                'iEmployeeSalcode' => $salCode,
                'iLeaveType' => $leaveType,
                'isHalfDayLeave' => $hf,
                'iLeaveStartDate' => $sDate1,
                'iLeaveEndDate' => $eDate1,
                'iLeaveComment' => $comment
                
            ));
            $applyLeaveData = $result->ApplyLeaveByEmployeeResult;
            return json_encode($applyLeaveData);
            
            
            
        }
        catch (Exception $e) {
            return $e->getMessage();
        }
        
    }
    
    //function to get self swipe hours 
    public function fnGetSelfSwipeData($parameters)
    {
        try {
            
            $salCode  = (int) $this->sanitize(trim($parameters["salCode"]));
            $userName = $this->sanitize(trim($parameters["userName"]));
            
            
            
            //consume by new ams WebService
            $url    = "http://intranetplp/AMStest/WebService/AMSService.asmx?wsdl";
            $client = new SoapClient($url, array(
                'trace' => true
            ));
            $result = $client->GetSwipeDataDetailsByEmloyeeSalcde(array(
                'iUserName' => $userName,
                'iSalcode' => $salCode
            ));
            
            $applyLeaveData = $result->GetSwipeDataDetailsByEmloyeeSalcdeResult->SwipeDataViewModel;
            return json_encode($applyLeaveData);
            
        }
        catch (Exception $e) {
            return $e->getMessage;
        }
    }
    
    
}
?>

