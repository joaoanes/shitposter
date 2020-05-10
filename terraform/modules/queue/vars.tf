
variable "name" {

}

variable "fifo" {
  default = false
}

variable "retention" {
  default = 86400
}

variable "dlq" {
  default = true
}

variable "visibility_timeout" {
  default = 900
}
