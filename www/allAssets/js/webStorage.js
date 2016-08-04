$( document ).ready(function() {
		"use strict";
		var borderForDropdown;
		$(".drop-down-btn").click(function(){
			
			$(this).parent().siblings("li").toggle("fast");
				
				if (borderForDropdown === "solid"){
				$(".li").css("border-style","none");
				borderForDropdown = "none"; 
				}
				else
				{
				$(".li").css("border-style","solid");
				borderForDropdown = "solid";
				}
				
			
			
		});
		
		
});