<?php
namespace App\Exceptions;

use RuntimeException;

class InsufficientFundsException extends RuntimeException
{
    public function __construct(string $message = 'Insufficient funds', int $code = 422)
    {
        parent::__construct($message, $code);
    }
}
