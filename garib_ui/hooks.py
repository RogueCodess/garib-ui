app_name = "garib_ui"
app_title = "Garib UI"
app_publisher = "Garib Appliances"
app_description = "Inventory back-office UI for Garib Appliances"
app_version = "0.0.1"

# Makes /garib serve garib_ui/www/garib.html
website_route_rules = [
    {"from_route": "/garib/<path:app_path>", "to_route": "garib"},
]
