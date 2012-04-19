package com.socialcomputing.wps.components.events
{
	import flash.events.Event;
	
	public class ErrorEvent extends Event
	{
		public static const ERROR:String = "error";
		
		private var _status:String;
		private var _origin:String;
		private var _code:int;
		private var _track:int;
		
		public function ErrorEvent(origin:String, code:int, status:String, track:uint, bubbles:Boolean=false, cancelable:Boolean=false)
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
		public function get track():int
		{
			return _track;
		}
	}
}