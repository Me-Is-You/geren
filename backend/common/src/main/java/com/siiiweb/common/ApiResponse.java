package com.siiiweb.common;
public class ApiResponse<T>{public int code;public String message;public T data;public ApiResponse(){}public ApiResponse(int c,String m,T d){code=c;message=m;data=d;}public static <T> ApiResponse<T> ok(T d){return new ApiResponse<>(0,"ok",d);}public static <T> ApiResponse<T> fail(String m){return new ApiResponse<>(-1,m,null);}}
