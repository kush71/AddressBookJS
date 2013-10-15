<%@ Page Language="C#" AutoEventWireup="true"  %>
<%@ Import Namespace="System" %>
<%@ Import Namespace="System.Web.Security" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head id="Head1" runat="server">
	<title></title>
	<script src="./Scripts/jquery-1.7.1.js"></script>
	<script src="./Scripts/jquery-ui-1.8.20.js"></script>
	<script src="./Scripts/ContactListMVC.js"></script>
    <script runat="server">
        protected void Page_Load(object sender, EventArgs e)
        {
            ////Welcome.Text = "Hello, " + Context.User.Identity.Name;
            Response.Redirect("ContactsMVC.html");
        }
    </script>
</head>
<body>
	<%--<asp:Label ID="Welcome" runat="server" />
	<h3>Your contact list :</h3>--%>
	<form id="Form1" runat="server">
	</form>
</body>
</html>
