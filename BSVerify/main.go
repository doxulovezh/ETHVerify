package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"strings"
	"time"

	acc "web/util"

	_ "github.com/go-sql-driver/mysql"
	"github.com/kataras/iris/v12"
	"github.com/kataras/iris/v12/middleware/recover"
	"github.com/patrickmn/go-cache" // 使用前先import包
	"github.com/rs/cors"
)

type setting struct {
	ServerIP   string `json:"serverIP"`
	ServerPort string `json:"serverPort"`
	IPandPort  string `json:"IPandPort"`
}
type verify_msg struct {
	Verifyaddress string `json:"verifyaddress"`
	Sig           string `json:"sig"`
	From          string `json:"from"`
	Code          string `json:"code"`
}
type setcode_msg struct {
	Appid         string `json:"appid"`
	Time          int64  `json:"time"`
	Token         string `json:"token"`
	Verifyaddress string `json:"verifyaddress"`
}

var app *iris.Application
var ServerIP string
var ServerPort string
var Codecatch *cache.Cache
var Tokencatch *cache.Cache
var IPandPort string = "http://127.0.0.1:30000/verify"
var VerifyAPPID string = "0xca90e5bde99cea901ebc70ea03b7f499a84b330d8e129b4ee5263c903dae7f71"

func main() {
	InitServerSetting()
	//SQL
	Codecatch = cache.New(3*time.Minute, 3*time.Minute)
	Tokencatch = cache.New(30*time.Minute, 30*time.Minute)
	app = iris.New()
	//跨域
	// 解决跨域的主要代码
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowCredentials: true,
		Debug:            true,
	})
	app.WrapRouter(c.ServeHTTP)

	// 日志监控
	app.Use(recover.New())
	// app.Use(logger.New())
	// app.Use(CorsALL)
	//通用
	app.Post("/GetCode", GetCode)                         //
	app.Post("/GetETHAddressVerify", GetETHAddressVerify) //
	app.Run(iris.TLS(ServerIP+":"+ServerPort, "businessserver.cer", "businessserver.key"), iris.WithoutServerError(iris.ErrServerClosed))
	// app.Listen(ServerIP+":"+ServerPort, iris.WithoutServerError(iris.ErrServerClosed))
}

//初始化服务器设置
func InitServerSetting() {
	//读取配置文件
	//获得本地设置JSON
	fjson, err := os.Open("setting.json")
	if err != nil {
		fmt.Println(err, "setting.json读取错误")
	}
	var json_buff []byte = make([]byte, 1000)
	defer fjson.Close()
	cont, _ := fjson.Read(json_buff)
	json_buff = json_buff[:cont]
	fjson.Close()
	var SET setting
	err = json.Unmarshal(json_buff, &SET)
	if err != nil {
		fmt.Println(err, "setting.json 反序列化错误")
	}
	//设置本地JSON参数
	ServerIP = SET.ServerIP
	ServerPort = SET.ServerPort
	IPandPort = SET.IPandPort
	fmt.Println("load setting success!")
	fmt.Println("ServerIP:", ServerIP)
	fmt.Println("ServerPort:", ServerPort)
	fmt.Println("IPandPort:", IPandPort)
}

type getcode_msg struct {
	State string `json:"state"`
	Code  string `json:"msg"`
}
type MSG struct {
	Code string `json:"code"`
}

func GetCode(ctx iris.Context) {
	Msg := &setcode_msg{}
	if err := ctx.ReadJSON(Msg); err != nil {
		ctx.Write([]byte(fmt.Sprint(err)))
		return
	} else {
		// var resmsg getcode_msg
		if Msg.Appid == VerifyAPPID {
			fmt.Println(time.Now().Unix())
			if time.Now().Unix()-Msg.Time < 1000 && time.Now().Unix()-Msg.Time > -1000 {
				_, found := Tokencatch.Get(Msg.Token) //防止重放攻击Replay Attack
				if found {
					ctx.WriteString("Replay Attack")
					return
				} else {
					//产生hash
					code := acc.CalculateHashcode(fmt.Sprint(time.Now().UnixMilli()))
					//成功鉴权
					Codecatch.Set(code, Msg.Verifyaddress, cache.DefaultExpiration)
					Tokencatch.Set(Msg.Token, true, cache.DefaultExpiration)
					var RES getcode_msg
					RES.State = "success"
					RES.Code = code
					resss, _ := json.Marshal(RES)
					ctx.Write(resss)
					return
				}
			} else {
				ctx.WriteString("time error")
				return
			}
		} else {
			ctx.WriteString("Appid error")
			return
		}
	}
}
func GetETHAddressVerify(ctx iris.Context) {
	Msg := &verify_msg{}
	if err := ctx.ReadJSON(Msg); err != nil {
		ctx.Write([]byte(fmt.Sprint(err)))
		return
	} else {
		//是否重复code
		value, found := Codecatch.Get(Msg.Code) //防止重放攻击
		if found {
			if strings.Compare(Msg.Verifyaddress, value.(string)) == 0 {
				//进行验证
				boo := VerifyNodeJs(*Msg)
				fmt.Println(string(boo))
				if string(boo) == "true" {
					var RES getcode_msg
					RES.State = "success"
					RES.Code = Msg.Verifyaddress + "," + Msg.From
					buff, _ := json.Marshal(RES)
					ctx.Write(buff)
					return
				} else {
					ctx.WriteString("Verification signature address mismatch")
					return
				}
			} else {
				ctx.WriteString("The verification address corresponding to the verify code does not match the signature address")
				return
			}
		} else {
			ctx.WriteString("Verify Code Invalid")
			return
		}

	}
}

//验证请求
func VerifyNodeJs(messages verify_msg) []byte {
	//post请求提交json数据
	url := "http://127.0.0.1:30000/verify"
	method := "POST"
	booo, _ := json.Marshal(messages)
	payload := strings.NewReader(string(booo))

	timeout := time.Duration(35 * time.Second)
	client := &http.Client{
		Timeout: timeout,
	}
	req, err := http.NewRequest(method, url, payload)

	if err != nil {
		fmt.Println(err)
		return []byte(err.Error())
	}
	req.Header.Add("Content-Type", "application/json")

	res, err := client.Do(req)
	if err != nil {
		fmt.Println(err)
		return []byte(err.Error())
	}
	defer res.Body.Close()

	body, err := ioutil.ReadAll(res.Body)
	if err != nil {
		fmt.Println(err)
		return []byte(err.Error())
	}
	fmt.Println(string(body))
	return body
}
