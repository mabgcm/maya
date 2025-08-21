<?php
/**
 * EDIT THE VALUES BELOW THIS LINE TO ADJUST THE CONFIGURATION
 * EACH OPTION HAS A COMMENT ABOVE IT WITH A DESCRIPTION
 */
/**
 * Specify the email address to which all mail messages are sent.
 * The script will try to use PHP's mail() function,
 * so if it is not properly configured it will fail silently (no error).
 */
$mailTo     = 'email@example.com';

/**
 * Set the message that will be shown on success
 */
$successMsg = 'Thank you, mail sent successfuly!';

/**
 * Set the message that will be shown if not all fields are filled
 */
$fillMsg    = 'Please fill all fields!';

/**
 * Set the message that will be shown on error
 */
$errorMsg   = 'Hm.. seems there is a problem, sorry!';

/**
 * DO NOT EDIT ANYTHING BELOW THIS LINE, UNLESS YOU'RE SURE WHAT YOU'RE DOING
 */

?>
<?php
if(
    !isset($_POST['contact-fname']) || 
	!isset($_POST['contact-email']) ||
	!isset($_POST['contact-subject']) ||
	!isset($_POST['contact-message']) ||
    empty($_POST['contact-fname']) ||
    empty($_POST['contact-email']) ||
	empty($_POST['contact-subject']) ||
	empty($_POST['contact-message']) 
	
) {
	
	if( empty($_POST['contact-fname']) && empty($_POST['contact-email']) && empty($_POST['contact-phone']) && empty($_POST['contact-message']) ) {
		$json_arr = array( "type" => "error", "msg" => $fillMsg );
		echo json_encode( $json_arr );		
	} else {

		$fields = "";
		if( !isset( $_POST['contact-fname'] ) || empty( $_POST['contact-fname'] ) ) {
			$fields .= "Name";
		}
	
		if( !isset( $_POST['contact-email'] ) || empty( $_POST['contact-email'] ) ) {
			if( $fields == "" ) {
				$fields .= "Email";
			} else {
				$fields .= ", Email";
			}
		}
		
		if( !isset( $_POST['contact-subject'] ) || empty( $_POST['contact-subject'] ) ) {
			if( $fields == "" ) {
				$fields .= "Subject";
			} else {
				$fields .= ", Subject";
			}
		}

		if( !isset( $_POST['contact-message'] ) || empty( $_POST['contact-message'] ) ) {
			if( $fields == "" ) {
				$fields .= "Message";
			} else {
				$fields .= ", Message";
			}		
		}	
		$json_arr = array( "type" => "error", "msg" => "Please fill ".$fields." fields!" );
		echo json_encode( $json_arr );		
	}

} else {

	// Validate e-mail
	if (!filter_var($_POST['contact-email'], FILTER_VALIDATE_EMAIL) === false) {

		$msg = "";
		if( $_POST['contact-fname'] != "") { $msg .= "First Name: ".$_POST['contact-fname']."\r\n"; }
		if( $_POST['contact-lname'] != "") { $msg .= "Last Name: ".$_POST['contact-lname']."\r\n"; }
		if( $_POST['contact-email'] != "") { $msg .= "Email: ".$_POST['contact-email']."\r\n"; }
		if( $_POST['contact-subject'] != "") { $msg .= "Subject: ".$_POST['contact-subject']."\r\n"; }
		if( $_POST['contact-message'] != "") { $msg .= "Message: ".$_POST['contact-message']."\r\n"; }

		$success = @mail($mailTo, $_POST['contact-email'], $msg, 'From: ' . $_POST['contact-fname'] . " " . $_POST['contact-lname'] . '<' . $_POST['contact-email'] . '>');

		if ($success) {
			$json_arr = array( "type" => "success", "msg" => $successMsg );
			echo json_encode( $json_arr );
		} else {
			$json_arr = array( "type" => "error", "msg" => $errorMsg );
			echo json_encode( $json_arr );
		}

	} else {
 		$json_arr = array( "type" => "error", "msg" => "Please enter valid email address!" );
		echo json_encode( $json_arr );	
	}
}
?>