<?php
$url = $_GET['url'];

/*
function checkXMLContent( $url )
{
    $content = file_get_contents($url);
    try { $rss = new SimpleXmlElement($content); }
    catch(Exception $e){
      return false;
    }
    return true;
}
*/
//if( checkXMLContent( $url ) ){
  header('Content-type: text/xml; charset=utf-8');
  echo file_get_contents($url);
//}

?>
