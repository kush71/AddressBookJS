﻿<%@ Page Language="C#" AutoEventWireup="true"  %>
<%@ Import Namespace="System" %>
<%@ Import Namespace="System.Web.Security" %>
<%@ Import Namespace="System.Collections.Generic" %>

<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head id="Head1" runat="server">
	<title>Forms Authentication - Login</title>
    <script runat="server">
        private Dictionary<string, string> loginPass = new Dictionary<string, string>(){
        {"user1", "123"},
        {"user2", "456"},
        {"user3", "789"}};

        protected void Page_Load(object sender, EventArgs e)
        {
            PassPromt.Attributes.Add("stye", "width: 50em");
              
            foreach (var login in loginPass.Keys)
            {
                var cntr = new HtmlGenericControl("div");
                cntr.InnerHtml = "login: " + login + ";   password: " + loginPass[login];
                cntr.Attributes.Add("stye", "width: 45em");
                PassPromt.Controls.Add(cntr);
            }
        }
        
        protected void Logon_Click(object sender, EventArgs e)
        {
            bool authenticated = false;
            foreach (var login in loginPass.Keys)
            {
                if ((login.ToUpper() == UserLogin.Text.ToUpper()) && (loginPass[login] == UserPass.Text))
                {
                    authenticated = true;
                    break;
                }
            }
            /*if (loginPass.Keys.Any(log => log.ToUpper() == UserLogin.Text.ToUpper())) && (loginPass[UserLogin.Text] == UserPass.Text)*/
            if (authenticated)
            {
                FormsAuthentication.RedirectFromLoginPage
                   (UserLogin.Text, Persist.Checked);
            }
            else
            {
                Msg.Text = "Invalid credentials. Please try again.";
            }
        }
    </script>
</head>
<body>
	<form id="form1" runat="server">
		<h3>Logon Page</h3>
		<table>
			<tr>
				<td>E-mail address:</td>
				<td>
					<asp:TextBox ID="UserLogin" runat="server" /></td>
				<td>
					<asp:RequiredFieldValidator ID="UserLoginRequiredFieldValidator"
						ControlToValidate="UserLogin"
						Display="Dynamic"
						ErrorMessage="Cannot be empty."
						runat="server" />
				</td>
			</tr>
			<tr>
				<td>Password:</td>
				<td>
					<asp:TextBox ID="UserPass" TextMode="Password"
						runat="server" />
				</td>
				<td>
					<asp:RequiredFieldValidator ID="UserPassRequiredFieldValidator"
						ControlToValidate="UserPass"
						ErrorMessage="Cannot be empty."
						runat="server" />
				</td>
			</tr>
			<tr>
				<td>Remember me?</td>
				<td>
					<asp:CheckBox ID="Persist" runat="server" /></td>
			</tr>
		</table>
		<asp:Button ID="Submit1" OnClick="Logon_Click" Text="Log On"
			runat="server" />
		<p>
			<asp:Label ID="Msg" ForeColor="red" runat="server" />
		</p>
        <div>
            <div id="PassPromt" runat="server" style="width: 50em"  />
        </div>
	</form>
</body>
</html>
