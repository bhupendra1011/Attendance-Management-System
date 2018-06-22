<?PHP

// check for user cookies 
if(isset($_GET['task']) && !empty($_GET['task']))
{

$task = $_GET['task'];


if ($task == "login")
{ $arr = array();

//if(isset($_COOKIE['amsmobile'] ['username']) && isset($_COOKIE['amsmobile'] ['password']))
if(isset($_COOKIE['amsmobile'] ['username']) )	
{
    $arr["username"]= $_COOKIE['amsmobile'] ['username'];
   // $arr["password"]= $_COOKIE['amsmobile'] ['password'];
}
else  { $arr["error"] = "user not saved"; }

echo json_encode($arr);
}

elseif ($task == "logout")
{

//if(isset($_COOKIE['amsmobile'] ['username']) && isset($_COOKIE['amsmobile'] ['password']))
if(isset($_COOKIE['amsmobile'] ['username']))
{
    setcookie("amsmobile[username]","", time()- 3600);
   // setcookie("amsmobile[password]","", time()- 3600);
    $arr["done"] = "cookies cleared";
}
else  { $arr["error"] = "cookie not exist"; }

echo json_encode($arr);
  


}



}

?>