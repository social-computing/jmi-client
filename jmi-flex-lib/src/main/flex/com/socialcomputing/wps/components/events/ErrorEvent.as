package com.socialcomputing.wps.components.events
{
	import flash.events.Event;
	
	public class ErrorEvent extends Event
	{
		public static const ERROR:String = "error";
		
		private var _status:String;
		private var _origin:String;
		private var _code:int;
		
		public function ErrorEvent(origin:String, code:int, status:String, bubbles:Boolean=false, cancelable:Boolean=false)
		{
			super(ERROR, bubbles, cancelable);
			this._status = status;
			this._origin = origin;
			this._code = code;
		}

		public function get status():String
		{
			return _status;
		}
		public function get origin():String
		{
			return _origin;
		}
		public function get code():int
		{
			return _code;
		}
	}
}